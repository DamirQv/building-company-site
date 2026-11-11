import Image from "next/image";

export function HeroBackground() {
  return (
    <Image
      src="/hero-talgar.jpeg"
      alt="Современный частный дом"
      fill
      priority
      sizes="100vw"
      className="object-cover object-[68%_center] max-md:object-center"
    />
  );
}
