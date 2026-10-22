"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

/**
 * Casca dos filtros: no desktop fica sempre aberta na lateral; no mobile vira
 * a tela "Filtrar veículos" do Figma, com o CTA fixo no pé.
 * O formulário em si é HTML puro (GET para /comprar) e funciona sem JS.
 */
export function FilterPanel({ total, children }: { total: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filtrar
      </button>

      <div
        className={`${open ? "fixed inset-0 z-50 flex flex-col bg-white" : "hidden"} lg:static lg:block lg:bg-transparent`}
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        aria-label="Filtrar veículos"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
          <button type="button" onClick={() => setOpen(false)} aria-label="Fechar filtros" className="grid size-11 place-items-center">
            <X className="size-5" aria-hidden="true" />
          </button>
          <p className="font-display font-semibold">Filtrar veículos</p>
          <a href="/comprar" className="px-2 text-sm font-semibold text-brand">Limpar</a>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 lg:overflow-visible lg:p-0">{children}</div>
        {/* o botão de envio do mobile submete o formulário pelo id */}
        <div className="border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden">
          <button form="filtros" className="h-12 w-full rounded-lg bg-brand text-sm font-semibold text-white">
            Ver {total.toLocaleString("pt-BR")} veículos
          </button>
        </div>
      </div>
    </>
  );
}

/** Select que reenvia o formulário ao mudar (ordenação, marca → modelos). */
export function AutoSubmitSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} onChange={(event) => event.currentTarget.form?.requestSubmit()} />;
}
