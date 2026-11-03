import type { Metadata } from "next";

const SITE_ORIGIN = "https://standardstroy.kz";
const OG_IMAGE = {
  url: `${SITE_ORIGIN}/current-projects/shukshina.jpeg`,
  width: 1280,
  height: 720,
  alt: "Этап строительства дома, Standard Stroy",
};

type PageMetadataInput = {
  path: string;
  title: string;
  description: string;
  robots?: Metadata["robots"];
};

export function createPageMetadata({
  path,
  title,
  description,
  robots,
}: PageMetadataInput): Metadata {
  const url = new URL(path, SITE_ORIGIN).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "ru_KZ",
      url,
      siteName: "Standard Stroy",
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
    ...(robots ? { robots } : {}),
  };
}
