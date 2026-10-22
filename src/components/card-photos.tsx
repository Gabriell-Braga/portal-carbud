"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { VehiclePhoto } from "~/lib/types";
import { CarArt } from "./car-art";

const zoom = "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105";

/**
 * Fotos do card: arrasta no celular (scroll-snap nativo) ou usa as setas.
 * Cada slide é um link para a ficha porque o carrossel fica acima do link
 * que cobre o card — sem isso o toque viraria clique e o arrasto morreria.
 */
export function CardPhotos({
  photos,
  cover,
  title,
  seed,
  href,
  priority,
}: {
  photos: VehiclePhoto[];
  cover: string | null;
  title: string;
  seed: string;
  href: string;
  priority: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const urls = photos.length ? photos.map((photo) => photo.card || photo.full) : cover ? [cover] : [];

  if (!urls.length) return <CarArt seed={seed} className="transition-transform duration-500 ease-out group-hover:scale-105" />;

  function go(step: number) {
    const el = track.current;
    if (!el) return;
    const next = (index + step + urls.length) % urls.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  const arrow =
    "absolute top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:scale-105 hover:bg-white";

  return (
    <>
      <div
        ref={track}
        onScroll={(event) => {
          const el = event.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="relative z-[1] flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {urls.map((url, i) => (
          <Link key={url} href={href} tabIndex={-1} aria-hidden="true" className="h-full w-full shrink-0 snap-start overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={i === 0 ? title : ""} className={zoom} loading={priority && i === 0 ? "eager" : "lazy"} draggable={false} />
          </Link>
        ))}
      </div>

      {urls.length > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className={`${arrow} left-2`}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Próxima foto" className={`${arrow} right-2`}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1" aria-hidden="true">
            {urls.map((url, i) => (
              <span
                key={url}
                className={`h-1.5 rounded-full bg-white shadow-sm transition-all duration-300 ${i === index ? "w-4" : "w-1.5 opacity-60"}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
