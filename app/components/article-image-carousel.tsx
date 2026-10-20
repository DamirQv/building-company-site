"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ArticleImage } from "@/lib/articles";

const SWIPE_THRESHOLD_PX = 40;

export function ArticleImageCarousel({
  images,
  title,
}: {
  images: ArticleImage[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="mx-auto mt-6 flex aspect-[16/9] max-w-6xl items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
        Фотография не добавлена
      </div>
    );
  }

  const showControls = images.length > 1;
  const changeSlide = (nextIndex: number) => {
    if (nextIndex === activeIndex) return;
    setActiveIndex(nextIndex);
    setHasInteracted(true);
  };
  const showPrevious = () => {
    changeSlide((activeIndex - 1 + images.length) % images.length);
  };
  const showNext = () => {
    changeSlide((activeIndex + 1) % images.length);
  };

  return (
    <figure
      aria-label={`Фотографии публикации «${title}»`}
      aria-roledescription={showControls ? "карусель" : undefined}
      className="mx-auto mt-6 max-w-6xl overflow-hidden rounded-2xl bg-slate-200"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (!showControls || startX === null || endX === undefined) return;
        const distance = endX - startX;
        if (Math.abs(distance) < SWIPE_THRESHOLD_PX) return;
        if (distance > 0) showPrevious();
        else showNext();
      }}
    >
      <div className="relative aspect-[16/9] overflow-hidden touch-pan-y">
        <Image
          key={images[activeIndex].src}
          src={images[activeIndex].src}
          alt={images[activeIndex].alt}
          fill
          preload={activeIndex === 0}
          sizes="(max-width: 768px) 100vw, 1152px"
          className="pointer-events-none object-cover"
        />

        {showControls && !hasInteracted && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-[5] -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950/70 px-4 py-2 text-xs font-medium text-white shadow-sm">
            <span className="md:hidden">Свайпните, чтобы увидеть другие фото →</span>
            <span className="hidden md:inline">Листайте фотографии стрелками</span>
          </div>
        )}

        {showControls && (
          <>
            <button
              type="button"
              aria-label="Предыдущая фотография"
              onClick={showPrevious}
              className="absolute left-3 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-900 shadow-md transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800 sm:left-5 sm:size-12"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              aria-label="Следующая фотография"
              onClick={showNext}
              className="absolute right-3 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-900 shadow-md transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800 sm:right-5 sm:size-12"
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}
      </div>

      {showControls && (
        <div className="flex min-h-12 items-center justify-center gap-1 bg-white px-4 py-1.5">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={`Показать фотографию ${index + 1} из ${images.length}`}
              aria-pressed={index === activeIndex}
              onClick={() => changeSlide(index)}
              className="flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800"
            >
              <span
                aria-hidden="true"
                className={`size-2.5 rounded-full transition ${
                  index === activeIndex ? "bg-sky-800" : "bg-slate-300 hover:bg-slate-400"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}
