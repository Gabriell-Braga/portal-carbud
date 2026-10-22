"use client";

import { useState } from "react";
import type { VehiclePhoto } from "~/lib/types";
import { CarArt } from "./car-art";

/** Foto principal + miniaturas. Sem foto, a ilustração do Figma ocupa o lugar. */
export function Gallery({ photos, title, seed }: { photos: VehiclePhoto[]; title: string; seed: string }) {
  const [index, setIndex] = useState(0);
  const current = photos[index];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-subtle lg:aspect-video">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.full} alt={`${title} — foto ${index + 1} de ${photos.length}`} className="h-full w-full object-cover" />
        ) : (
          <CarArt seed={seed} />
        )}
        {photos.length > 1 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 text-xs text-white">
            {index + 1} / {photos.length} fotos
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {photos.map((photo, i) => (
            <li key={photo.id} className="w-24 shrink-0 lg:w-auto">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={`block aspect-video w-full overflow-hidden rounded-lg ring-2 ${i === index ? "ring-brand" : "ring-transparent hover:ring-line"}`}
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
