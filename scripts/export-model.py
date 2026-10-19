"""Export HackForge AI's phishing text model for the website.

Downloads text_threat_model.pkl and text_vectorizer.pkl from Harshdeep's Hugging Face
account, then writes:
  src/data/hackforge-text-model.json   weights the site runs in TypeScript
  scripts/model-fixtures.json          real Python scores, checked by scripts/check-model.mjs

Needs: pip install scikit-learn==1.3.2 joblib nltk==3.8.1 requests
Note: .pkl files can run code when loaded. Only run this on model files you trust.
"""
import json
import math
import re
from pathlib import Path

import joblib
import nltk
import requests
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts" / ".models"
SOURCES = {
    "text_threat_model.pkl": "https://huggingface.co/hrshmann/text_threat_model.pkl/resolve/main/text_threat_model.pkl",
    "text_vectorizer.pkl": "https://huggingface.co/hrshmann/text_vectorizer.pkl/resolve/main/text_vectorizer.pkl",
}

CACHE.mkdir(parents=True, exist_ok=True)
for name, url in SOURCES.items():
    dest = CACHE / name
    if not dest.exists() or dest.stat().st_size == 0:
        print("downloading", name)
        with requests.get(url, stream=True, timeout=120) as r:
            r.raise_for_status()
            with open(dest, "wb") as f:
                for chunk in r.iter_content(1 << 20):
                    f.write(chunk)

model = joblib.load(CACHE / "text_threat_model.pkl")
vectorizer = joblib.load(CACHE / "text_vectorizer.pkl")
nltk.download("stopwords", quiet=True)
stop_words = set(stopwords.words("english"))
stemmer = PorterStemmer()


# copied unchanged from HackForge-AI-V2/modules/text_scanner.py
def preprocess_text(text):
    text = str(text)
    text = re.sub(r'http\\S+|www\\S+', ' ', text)
    text = re.sub(r'\\S+@\\S+', ' ', text)
    text = re.sub(r'escapenumber', ' ', text)
    text = re.sub(r'forwarded by|original message|subject|cc|sent|from|to', ' ', text)
    text = re.sub(r'[^a-zA-Z]', ' ', text)
    text = text.lower().split()
    text = [stemmer.stem(word) for word in text if word not in stop_words and len(word) > 2]
    return " ".join(text)


terms = {
    term: [float(f"{vectorizer.idf_[i]:.9g}"), float(f"{model.coef_[0][i]:.9g}")]
    for term, i in vectorizer.vocabulary_.items()
}
out = ROOT / "src" / "data" / "hackforge-text-model.json"
out.parent.mkdir(parents=True, exist_ok=True)
json.dump(
    {
        "source": "HackForge AI text_threat_model.pkl + text_vectorizer.pkl (TF-IDF 1-2 grams, LinearSVC)",
        "intercept": float(model.intercept_[0]),
        "stopwords": sorted(stop_words),
        "vectorizerStopwords": sorted(vectorizer.get_stop_words() or []),
        "terms": terms,
    },
    open(out, "w"),
    separators=(",", ":"),
)
print(f"wrote {out} ({out.stat().st_size // 1024} KB, {len(terms)} terms)")

samples = [
    "URGENT: your account has been suspended due to unusual activity. Verify your password within 24 hours at http://secure-login-update.xyz",
    "Hi Harshdeep, our team looked at HackForge AI and liked it. Are you free for a call on Thursday about the ML engineer role?",
    "Congratulations! You have won a $1000 gift card. Click here to claim your prize now.",
    "Dear customer, your bank account is locked. Confirm your card number and PIN to restore access.",
    "Can we move tomorrow's meeting to 3pm? I need to finish the quarterly report first.",
    "Your Amazon order has shipped and will arrive on Friday.",
    "Final notice: your PayPal account will be permanently limited unless you update your billing information today.",
    "Hey, are you coming to the football match this weekend? Bring snacks!",
    "We are hiring a machine learning engineer in Dubai. Please send your resume and portfolio.",
    "Forwarded by John: original message about the project timeline and budget review.",
    "You are selected for a work-from-home job paying $500 per day, no experience needed. Reply with your bank details.",
    "Attached is the invoice for last month's consulting work. Payment terms are 30 days.",
    "Act now! Limited offer on cheap meds, viagra and cialis without prescription.",
    "Your verification code is 482913. Do not share it with anyone.",
    "Thanks for the interview today. We will get back to you next week with feedback.",
    "IRS notice: you owe back taxes. Pay immediately with iTunes gift cards to avoid arrest.",
    "Dear sir, I am a prince with 10 million dollars and need your help to transfer the funds.",
    "Lunch at the new place near the office? My treat.",
    "Security alert: unusual sign-in attempt detected. If this wasn't you, reset your password using the link below.",
    "The dataset is cleaned and the model reached 94% accuracy on the validation set.",
    "",
    "a b c",
]
fixtures = []
for s in samples:
    vec = vectorizer.transform([preprocess_text(s)])
    d = float(model.decision_function(vec)[0])
    fixtures.append({"text": s, "decision": d, "prediction": int(model.predict(vec)[0])})
json.dump(fixtures, open(ROOT / "scripts" / "model-fixtures.json", "w"), indent=1)
print(f"wrote {len(fixtures)} fixtures")
