import { MetadataRoute } from "next";
import { BitrixNewsError, getPublishedNews, type NewsArticle } from "@/lib/news";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://standardstroy.kz";
  let publishedNews: NewsArticle[] = [];
  try {
    publishedNews = await getPublishedNews();
  } catch (error) {
    // Never log the raw error: it may contain a secret upstream webhook URL.
    console.error("[sitemap] News unavailable; serving static URLs", error instanceof BitrixNewsError
      ? { method: error.method, code: error.code, status: error.status }
      : { code: "unexpected_news_error" });
  }

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/uslugi`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/uslugi/proektirovanie`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/uslugi/arhitekturnyy-interer`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/uslugi/stroitelstvo-korobki`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/uslugi/predchistovaya-otdelka`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/uslugi/otdelka-pod-klyuch`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/uslugi/blagoustroystvo`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/uslugi/kommercheskoe-stroitelstvo`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/uslugi/proizvodstvennye-pomescheniya`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/materialy`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/materialy/doma-iz-finnblock`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/materialy/doma-iz-gazobloka`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/materialy/doma-iz-kirpicha`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/o-kompanii`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/otzyvy`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/kontakty`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/astana`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...publishedNews.map((article) => {
      const publishedAt = new Date(article.publishedAt);
      return {
        url: `${baseUrl}/blog/${article.slug}`,
        // No update date is available; omit invalid dates instead of inventing one.
        ...(Number.isNaN(publishedAt.getTime()) ? {} : { lastModified: publishedAt }),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    }),
    { url: `${baseUrl}/politika-konfidencialnosti`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
