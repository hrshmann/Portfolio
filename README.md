# HARSH//SCAN

Portfolio of Harshdeep Maan: a case file on bond paper. Next.js 15, GSAP, Lenis.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

The intro scan plays once per browser session. To see it again, open a private window or clear session storage.

## Change content

Every word on the site lives in [src/lib/content.ts](src/lib/content.ts): profile, the redacted About text, skills (epochs), case files, experience, education and evidence. Edit that file and the page updates.

| To add | Do this |
|---|---|
| **Signature** | Save a photo of it, run `python scripts/prepare-signature.py photo.jpg`, then set `signature: "/signature.png"` in `content.ts` |
| **Resume download** | Put the PDF at `public/Harshdeep-Maan-Resume.pdf`, then set `resume: "/Harshdeep-Maan-Resume.pdf"` |
| **New case file** | Add an entry to `cases` in `content.ts`. Its page at `/case/<slug>` is generated automatically |

## The phishing model

The contact form calls `/api/check`, which runs HackForge AI's phishing model (TF-IDF + LinearSVC) directly in TypeScript: no separate server. [src/lib/hackforge-model.ts](src/lib/hackforge-model.ts) mirrors `modules/text_scanner.py`, and [src/lib/porter.ts](src/lib/porter.ts) is a port of NLTK's Porter stemmer, checked identical to NLTK on 708,863 words.

The weights live in `src/data/hackforge-text-model.json`. To create or refresh it (after retraining, say):

```bash
pip install scikit-learn==1.3.2 joblib nltk==3.8.1 requests
python scripts/export-model.py     # downloads the .pkl files from Hugging Face, writes the JSON
node scripts/check-model.mjs       # compares the site's scores with Python's on 22 messages
```

Until that JSON exists, the form falls back to keyword rules and says so on screen.

## Make the contact form send email

Without setup, "Send message" opens the visitor's mail app with the message filled in. To send directly, create a free [Resend](https://resend.com) account and set:

```
RESEND_API_KEY=re_...
CONTACT_TO=harsh.info007@gmail.com
```

## Publish

Push the folder to GitHub, import it at [vercel.com](https://vercel.com), and add the environment variables above in the project settings. Vercel gives a free `*.vercel.app` address; a custom domain can be added later. Once a custom domain is live, also set `NEXT_PUBLIC_SITE_URL=https://your-domain` so link previews and the sitemap use it.

## Where things are

- `src/components/Shell.tsx`: smooth scroll, ink-wipe page transitions, intro state
- `src/components/Preloader.tsx`: the visitor scan
- `src/components/*.tsx`: one file per section
- `src/app/globals.css`: all styles; colour tokens at the top
- `src/app/api/`: phishing check and contact endpoints
