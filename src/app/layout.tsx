import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Courier_Prime, Libre_Franklin, Mrs_Saint_Delafield } from "next/font/google";
import Shell from "@/components/Shell";
import { profile } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const display = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--f-display" });
const body = Libre_Franklin({ subsets: ["latin"], variable: "--f-body" });
const type = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-type" });
const hand = Mrs_Saint_Delafield({ subsets: ["latin"], weight: "400", variable: "--f-hand" });

const description =
  "Harshdeep Maan, AI/ML engineer in Dubai. Machine learning for security, full-stack web apps, and HackForge AI.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Harshdeep Maan · AI/ML Engineer",
  description,
  openGraph: {
    type: "website",
    siteName: "Harshdeep Maan",
    title: "Harshdeep Maan · AI/ML Engineer",
    description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: "Harshdeep Maan · AI/ML Engineer", description },
};

// Tells search engines who the site is about
const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Harshdeep Maan",
  jobTitle: "AI/ML Engineer",
  url: siteUrl,
  image: `${siteUrl}/images/portrait.jpg`,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
  sameAs: [profile.linkedin, profile.github],
  knowsAbout: ["Machine learning", "NLP", "Cybersecurity", "Phishing detection", "Next.js", "Python"],
};

export const viewport: Viewport = {
  themeColor: "#ECEBE6",
  viewportFit: "cover",
};

// Runs before paint: marks JS as on (so reveal states apply) and skips the intro
// for visitors who already saw it this session.
const boot = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('hs-intro'))d.classList.add('seen')}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${type.variable} ${hand.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
