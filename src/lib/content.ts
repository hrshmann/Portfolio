// Every word on the site lives here. Edit this file to change content.

export const profile = {
  first: "Harshdeep",
  last: "Maan",
  role: "AI/ML Engineer",
  tags: "AI/ML ENGINEER / SECURITY / FULL-STACK",
  location: "Dubai, UAE",
  coords: "25.2048° N  55.2708° E",
  email: "harsh.info007@gmail.com",
  linkedin: "https://www.linkedin.com/in/harshdeep-maan-8579b831b",
  github: "https://github.com/hrshmann",
  status: "Available immediately",
  visa: "UAE employment visa",
  resume: "/Harshdeep-Maan-Resume.pdf" as string | null,
  // made with scripts/prepare-signature.py
  signature: "/signature.png" as string | null,
  portrait: "/images/portrait.jpg",
};

/** About paragraph. Strings are plain text, { r } segments start blacked out. */
export const dossier: (string | { r: string })[] = [
  "Computer science graduate (B.Tech 2026), now completing an M.Tech, based in ",
  { r: "Dubai, UAE" },
  ". Built ",
  { r: "HackForge AI" },
  " alone: a scanner that crawls a website, tests it for ",
  { r: "SQL injection and XSS" },
  ", and runs ",
  { r: "three trained classifiers" },
  " on what it finds. Also builds full-stack web apps in Next.js and Node.js, and has shipped live websites for ",
  { r: "paying clients" },
  ". Status: ",
  { r: "available immediately" },
  ".",
];

export const facts: [string, string][] = [
  ["Role", "AI/ML engineer, Python developer"],
  ["Based in", "Dubai, UAE"],
  ["Work permit", "UAE employment visa"],
  ["Education", "M.Tech CSE (2026–28), B.Tech CS (2022–26)"],
  ["Languages", "English, Hindi, Punjabi"],
];

export type Epoch = { title: string; items: string[]; loss: number };

export const epochs: Epoch[] = [
  {
    title: "Machine learning",
    items: ["Classification", "Feature engineering", "Model training & evaluation", "NLP", "Deep learning", "LLMs", "PyTorch", "Hugging Face Transformers", "Pandas", "NumPy"],
    loss: 0.912,
  },
  {
    title: "Security",
    items: ["Vulnerability assessment", "SQL injection testing", "XSS testing", "Phishing detection"],
    loss: 0.431,
  },
  {
    title: "Web",
    items: ["Next.js", "React", "Node.js", "Express", "WebSockets", "REST APIs", "Streamlit", "MongoDB", "MariaDB", "Firebase"],
    loss: 0.187,
  },
  {
    title: "Cloud",
    items: ["AWS EC2", "VPC & VPC peering", "Load balancing", "Auto scaling", "Hostinger"],
    loss: 0.064,
  },
  {
    title: "Languages & tools",
    items: ["Python", "JavaScript", "TypeScript", "C", "C++", "Git", "GitHub"],
    loss: 0.0012,
  },
];

export type Shot = { src: string; caption: string };

export type CaseFile = {
  slug: string;
  no: string;
  title: string;
  stamp: string;
  short: string;
  lead: string;
  stack: string[];
  meta: [string, string][];
  links: { label: string; href: string }[];
  findings: string[];
  /** 1440×900 screenshots in /public/images/cases */
  shots?: Shot[];
};

export const cases: CaseFile[] = [
  {
    slug: "hackforge-ai",
    no: "001",
    title: "HackForge AI",
    stamp: "DEPLOYED",
    short: "A website security scanner with three trained ML models behind it.",
    lead: "A website security scanner I built alone. It crawls a site, tests it for SQL injection and XSS, and flags the security risks it finds.",
    stack: ["Python", "PyTorch", "Hugging Face", "Streamlit", "Firebase"],
    meta: [
      ["Role", "Solo build"],
      ["Type", "Security tool, ML"],
      ["Status", "Live"],
    ],
    links: [
      { label: "hackforgeai.streamlit.app", href: "https://hackforgeai.streamlit.app" },
      { label: "github.com/hrshmann/HackForge-AI-V2", href: "https://github.com/hrshmann/HackForge-AI-V2" },
    ],
    findings: [
      "Crawls a target website and tests its pages for SQL injection and XSS.",
      "Vulnerability prediction classifier.",
      "Malicious URL detection classifier.",
      "Phishing and scam message detection, using NLP.",
      "Prepared the dataset for each model myself.",
      "All three models connected to one Streamlit app with a Firebase backend.",
    ],
    shots: [{ src: "/images/cases/hackforge.jpg", caption: "hackforgeai.streamlit.app · secure portal" }],
  },
  {
    slug: "vertex-trading",
    no: "002",
    title: "Vertex Trading",
    stamp: "SHIPPED",
    short: "Live crypto and forex prices pushed to the browser in real time.",
    lead: "A trading website with live crypto and forex prices and charts, pushed to the browser through a WebSocket gateway.",
    stack: ["Next.js", "TypeScript", "Node.js", "Express", "WebSockets", "MariaDB"],
    meta: [
      ["Role", "Full-stack build"],
      ["Type", "Real-time web app"],
      ["Status", "Live"],
    ],
    links: [
      { label: "vertexfxs.com", href: "https://vertexfxs.com" },
      { label: "github.com/hrshmann/Vertex", href: "https://github.com/hrshmann/Vertex" },
    ],
    findings: [
      "Real-time crypto and forex prices and charts over a WebSocket gateway.",
      "Client accounts with KYC identity verification.",
      "Email for account events.",
      "Admin panel for reviewing verifications.",
    ],
    shots: [{ src: "/images/cases/vertex.jpg", caption: "vertexfxs.com · live market table" }],
  },
  {
    slug: "client-websites",
    no: "003",
    title: "Client Websites",
    stamp: "DELIVERED",
    short: "Live websites for paying clients in Dubai and Pakistan.",
    lead: "Websites I built and launched for paying clients, working directly with each one on features and design changes.",
    stack: ["Web development", "Client work", "Deployment"],
    meta: [
      ["Role", "Freelance web developer"],
      ["Clients", "3"],
      ["Status", "All live"],
    ],
    links: [
      { label: "oktravel.ae", href: "https://oktravel.ae" },
      { label: "dxbejari.com", href: "https://dxbejari.com" },
      { label: "shais.pk", href: "https://shais.pk" },
    ],
    findings: [
      "OKTravel.ae (Jan–Jul 2025): built and launched the company's travel website, then handled testing and deployment.",
      "dxbejari.com: website for a Dubai Ejari (tenancy registration) services company.",
      "shais.pk: website for a cosmetics and boutique brand.",
    ],
    shots: [
      { src: "/images/cases/oktravel.jpg", caption: "oktravel.ae · travel agency" },
      { src: "/images/cases/dxbejari.jpg", caption: "dxbejari.com · Ejari registration" },
      { src: "/images/cases/shais.jpg", caption: "shais.pk · cosmetics & boutique" },
    ],
  },
  {
    slug: "route-planner",
    no: "004",
    title: "Route Planner",
    stamp: "TEAM LEAD",
    short: "Hackathon build comparing walking, bus, auto-rickshaw and train.",
    lead: "At the Next Quantum 1.0 hackathon I led a team that built a route planner comparing walking, bus, auto-rickshaw and train options by time and cost.",
    stack: ["Hackathon", "Team lead"],
    meta: [
      ["Role", "Team lead"],
      ["Event", "Next Quantum 1.0"],
      ["Type", "Hackathon build"],
    ],
    links: [],
    findings: [
      "Compares four ways to travel: walking, bus, auto-rickshaw and train.",
      "Ranks each option by time and by cost.",
      "Led the team from idea to working demo within the hackathon.",
    ],
  },
];

export type Entry = { dates: string; role: string; org: string; points: string[] };

export const experience: Entry[] = [
  {
    dates: "Jan 2026 – Jun 2026",
    role: "AI/ML Intern",
    org: "O7 Services",
    points: [
      "Six-month internship covering data analysis, machine learning, deep learning, NLP and LLMs.",
      "Python work on real datasets: cleaning data with Pandas and NumPy, training and evaluating models, and building Streamlit interfaces.",
    ],
  },
  {
    dates: "Jan 2025 – Jul 2025",
    role: "Web Developer, client project",
    org: "OKTravel.ae",
    points: [
      "Built and launched the company's travel website.",
      "Worked directly with the client on features and design changes, then handled testing and deployment.",
    ],
  },
  {
    dates: "Jun 2024 – Jul 2024",
    role: "Cybersecurity & Cloud Intern",
    org: "Hoping Minds",
    points: [
      "Set up EC2 instances, VPCs and VPC peering on AWS, and configured load balancers and auto scaling groups.",
      "Covered core cybersecurity and networking topics alongside the cloud work.",
    ],
  },
];

export const education: Entry[] = [
  {
    dates: "2026 – 2028",
    role: "M.Tech, Computer Science & Engineering",
    org: "CT Institution of Engineering, Management and Technology (IKGPTU)",
    points: ["Studying remotely, exams on campus."],
  },
  {
    dates: "2022 – 2026",
    role: "B.Tech, Computer Science",
    org: "CT Institution of Engineering, Management and Technology (IKGPTU)",
    points: ["CGPA 7.6 / 10."],
  },
];

export type Exhibit = { tag: string; big: string; title: string; note: string };

export const evidence: Exhibit[] = [
  { tag: "Exhibit 1", big: "500", title: "Overall Coordinator, Byte Verse 1.0", note: "Ran a college hackathon with about 500 participants." },
  { tag: "Exhibit 2", big: "×2", title: "Gold medal, Engineering Day Quiz", note: "Won it two years in a row." },
  { tag: "Exhibit 3", big: "Lead", title: "Team lead, Next Quantum 1.0", note: "Led the hackathon team behind the route planner." },
  { tag: "Exhibit 4", big: "IBM", title: "IBM training", note: "Data Science, Data Analysis, AI, Machine Learning and IBM Watson." },
  { tag: "Exhibit 5", big: "3", title: "Languages spoken", note: "English (professional), Hindi and Punjabi (native)." },
];
