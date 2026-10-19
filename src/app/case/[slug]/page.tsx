import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cases } from "@/lib/content";
import CaseView from "@/components/CaseView";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = cases.find((x) => x.slug === slug);
  return c ? { title: `${c.title} · Case ${c.no} · Harshdeep Maan`, description: c.lead } : {};
}

export default async function CasePage({ params }: Params) {
  const { slug } = await params;
  const i = cases.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  return <CaseView c={cases[i]} next={cases[(i + 1) % cases.length]} />;
}
