import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://dombuilding.kz";
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/uslugi`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/uslugi/proektirovanie`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/uslugi/stroitelstvo-korobki`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/uslugi/predchistovaya-otdelka`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/uslugi/otdelka-pod-klyuch`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/uslugi/blagoustroystvo`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/uslugi/kommercheskoe-stroitelstvo`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/uslugi/proizvodstvennye-pomescheniya`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/materialy`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/materialy/doma-iz-finnblock`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/materialy/doma-iz-gazobloka`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/materialy/doma-iz-kirpicha`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/proekty`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/obekty`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/o-kompanii`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/otzyvy`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/kontakty`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/astana`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/politika-konfidencialnosti`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
