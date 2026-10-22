"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { VehiclePhoto } from "~/lib/types";
import { CarArt } from "./car-art";

/**
 * Galeria da ficha: foto em 4:3 (o formato em que as lojas fotografam, então
 * nada é cortado), arrasto no celular por scroll-snap e setas sempre à vista.
 * As miniaturas são uma fileira que rola sozinha até a foto atual.
 * Sem foto, a ilustração do Figma ocupa o lugar.
 */
export function Gallery({ photos, title, seed }: { photos: VehiclePhoto[]; title: string; seed: string }) {
  const track = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  // alvo da rolagem em curso: dois cliques seguidos somam, em vez de ler o meio do caminho
  const goal = useRef(0);

  useEffect(() => {
    const list = thumbs.current;
    const thumb = list?.children[index] as HTMLElement | undefined;
    // rola só a fileira; scrollIntoView arrastaria a página junto
    if (list && thumb) list.scrollTo({ left: thumb.offsetLeft - (list.clientWidth - thumb.clientWidth) / 2, behavior: "smooth" });
  }, [index]);

  if (!photos.length) {
    return (
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-subtle">
        <CarArt seed={seed} />
      </div>
    );
  }

  function show(next: number) {
    const el = track.current;
    if (!el) return;
    const target = (next + photos.length) % photos.length;
    goal.current = target;
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  }

  const arrow =
    "absolute top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-white shadow transition hover:scale-105 hover:bg-ink/85";

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-subtle">
        <div
          ref={track}
          onScroll={(event) => {
            const el = event.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          onScrollEnd={(event) => {
            const el = event.currentTarget;
            goal.current = Math.round(el.scrollLeft / el.clientWidth);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") show(goal.current - 1);
            if (event.key === "ArrowRight") show(goal.current + 1);
          }}
          tabIndex={0}
          aria-label={`Fotos de ${title}`}
          className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto overscroll-x-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((photo, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.full}
              alt={`${title}, foto ${i + 1} de ${photos.length}`}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
              className="h-full w-full shrink-0 snap-start object-cover"
            />
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => show(goal.current - 1)} aria-label="Foto anterior" className={`${arrow} left-3`}>
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => show(goal.current + 1)} aria-label="Próxima foto" className={`${arrow} right-3`}>
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <span aria-live="polite" className="absolute right-3 bottom-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-white">
              {index + 1}/{photos.length}
            </span>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <ul ref={thumbs} className="relative mt-3 flex gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {photos.map((photo, i) => (
            <li key={photo.id} className="w-24 shrink-0 sm:w-28">
              <button
                type="button"
                onClick={() => show(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={`block aspect-[4/3] w-full overflow-hidden rounded-lg border-2 transition ${i === index ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
