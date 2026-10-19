import type { MetadataRoute } from "next";
import { cases } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    ...cases.map((c) => ({ url: `${siteUrl}/case/${c.slug}`, changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
