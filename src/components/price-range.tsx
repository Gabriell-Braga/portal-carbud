"use client";

import { useState } from "react";

const STEP = 5000;

/**
 * Faixa de preço da home (Figma 03 · Home): dois campos e o trilho duplo
 * mexem no mesmo valor. Os campos é que têm `name`; o trilho só ajuda a escolher.
 */
export function PriceRange({ min, max, className, children }: { min: number; max: number; className: string; children: React.ReactNode }) {
  const floor = Math.floor(min / STEP) * STEP;
  const ceil = Math.max(Math.ceil(max / STEP) * STEP, floor + STEP);
  const [low, setLow] = useState<number | null>(null);
  const [high, setHigh] = useState<number | null>(null);

  const lo = low ?? floor;
  const hi = high ?? ceil;
  const pct = (value: number) => ((value - floor) / (ceil - floor)) * 100;
  const parse = (raw: string) => (raw.replace(/\D/g, "") ? Number(raw.replace(/\D/g, "")) : null);

  return (
    <>
      <label className="sr-only" htmlFor="orc-min">Valor mínimo</label>
      <input id="orc-min" name="precoMin" inputMode="numeric" placeholder="Valor mínimo" value={low ?? ""} onChange={(e) => setLow(parse(e.target.value))} className={className} />
      <label className="sr-only" htmlFor="orc-max">Valor máximo</label>
      <input id="orc-max" name="precoMax" inputMode="numeric" placeholder="Valor máximo" value={high ?? ""} onChange={(e) => setHigh(parse(e.target.value))} className={className} />

      <span className="hidden lg:block" />
      {children}

      <div className="relative col-span-2 h-5 lg:col-span-3" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand"
          style={{ left: `${pct(Math.min(lo, hi))}%`, right: `${100 - pct(Math.max(lo, hi))}%` }}
        />
        {/* o teclado já tem os campos; o trilho fica fora do tab para não duplicar */}
        <input type="range" tabIndex={-1} min={floor} max={ceil} step={STEP} value={lo} onChange={(e) => setLow(Math.min(Number(e.target.value), hi - STEP))} className="range-thumb absolute inset-0 w-full" />
        <input type="range" tabIndex={-1} min={floor} max={ceil} step={STEP} value={hi} onChange={(e) => setHigh(Math.max(Number(e.target.value), lo + STEP))} className="range-thumb absolute inset-0 w-full" />
      </div>
      <p className="col-span-2 -mt-1 text-xs text-muted lg:col-span-4">Ajuste a faixa ou selecione uma sugestão acima.</p>
    </>
  );
}
