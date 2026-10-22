"use client";

import { Rotate3d } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Visão 360° da ficha: giro externo (quadros trocados conforme arrasta) e
 * panorâmica do interior (imagem 2:1 rolando em volta, como um cilindro).
 *
 * Os quadros só baixam quando a pessoa abre o giro: são até 72 imagens, e a
 * ficha não pode pagar isso no carregamento. A panorâmica é rolagem de fundo,
 * sem WebGL nem dependência; perde a correção de perspectiva no teto e no
 * chão, que é onde quase ninguém olha num carro.
 */
export function Viewer360({ spin, pano, title }: { spin: string[]; pano: string | null; title: string }) {
  const [mode, setMode] = useState<"spin" | "pano">(spin.length ? "spin" : "pano");

  return (
    <section className="rounded-2xl border border-line p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Visão 360°</h2>
        {spin.length > 0 && pano && (
          <div role="tablist" className="flex rounded-full border border-line p-1 text-sm font-semibold">
            {(["spin", "pano"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                onClick={() => setMode(item)}
                className={`rounded-full px-4 py-1.5 ${mode === item ? "bg-brand text-white" : "text-muted hover:text-ink"}`}
              >
                {item === "spin" ? "Externo" : "Interior"}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4">
        {mode === "spin" ? <Spin frames={spin} title={title} /> : <Pano url={pano!} title={title} />}
      </div>
    </section>
  );
}

/** Arrastar a largura inteira da caixa dá uma volta completa. */
function useDrag(onMove: (fraction: number) => void) {
  const start = useRef<{ x: number; width: number } | null>(null);
  return {
    onPointerDown(event: React.PointerEvent<HTMLElement>) {
      event.currentTarget.setPointerCapture(event.pointerId);
      start.current = { x: event.clientX, width: event.currentTarget.clientWidth };
    },
    onPointerMove(event: React.PointerEvent<HTMLElement>) {
      if (!start.current) return;
      onMove((event.clientX - start.current.x) / start.current.width);
      start.current.x = event.clientX;
    },
    onPointerUp() {
      start.current = null;
    },
  };
}

function Start({ onStart, label }: { onStart: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onStart}
      className="absolute inset-0 grid place-items-center bg-ink/30 text-white transition hover:bg-ink/40"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold shadow">
        <Rotate3d className="size-4" aria-hidden="true" /> {label}
      </span>
    </button>
  );
}

function Spin({ frames, title }: { frames: string[]; title: string }) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const position = useRef(0);
  const drag = useDrag((fraction) => {
    // arrastar para a direita gira o carro para a direita
    position.current = (position.current - fraction * frames.length + frames.length * 1000) % frames.length;
    setIndex(Math.floor(position.current));
  });

  function start() {
    for (const src of frames) new Image().src = src;
    setActive(true);
  }

  function step(offset: number) {
    position.current = (position.current + offset + frames.length) % frames.length;
    setIndex(Math.floor(position.current));
  }

  return (
    <div
      {...(active ? drag : {})}
      tabIndex={active ? 0 : -1}
      role={active ? "slider" : undefined}
      aria-label={active ? `Girar ${title}` : undefined}
      aria-valuemin={active ? 1 : undefined}
      aria-valuemax={active ? frames.length : undefined}
      aria-valuenow={active ? index + 1 : undefined}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") step(-1);
        if (event.key === "ArrowRight") step(1);
      }}
      className={`relative aspect-[16/10] touch-none select-none overflow-hidden rounded-xl bg-subtle ${active ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frames[index]} alt={`${title}, ângulo ${index + 1} de ${frames.length}`} draggable={false} className="h-full w-full object-cover" />
      {active ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-semibold text-white drop-shadow">Arraste para girar</p>
      ) : (
        <Start onStart={start} label="Girar 360°" />
      )}
    </div>
  );
}

function Pano({ url, title }: { url: string; title: string }) {
  const [active, setActive] = useState(false);
  const [offset, setOffset] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const drag = useDrag((fraction) => setOffset((current) => current + fraction * (box.current?.clientWidth ?? 0)));

  return (
    <div
      ref={box}
      {...(active ? drag : {})}
      role="img"
      aria-label={`Panorâmica 360° do interior: ${title}`}
      tabIndex={active ? 0 : -1}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") setOffset((current) => current + 40);
        if (event.key === "ArrowRight") setOffset((current) => current - 40);
      }}
      style={{ backgroundImage: `url(${url})`, backgroundPositionX: `${offset}px` }}
      className={`relative aspect-[16/10] touch-none select-none overflow-hidden rounded-xl bg-subtle bg-[length:auto_100%] bg-repeat-x ${active ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {active ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-semibold text-white drop-shadow">Arraste para olhar em volta</p>
      ) : (
        <Start onStart={() => setActive(true)} label="Ver interior em 360°" />
      )}
    </div>
  );
}
