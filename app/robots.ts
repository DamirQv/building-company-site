import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/private/", "/api/"],
    },
    sitemap: "https://standardstroy.kz/sitemap.xml",
    host: "https://standardstroy.kz",
  };
}
