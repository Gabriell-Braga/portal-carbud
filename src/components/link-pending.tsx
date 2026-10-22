"use client";

import { useLinkStatus } from "next/link";

/**
 * Vai dentro de um `<Link>`: enquanto a navegação dele está pendente, deixa
 * uma marca `[data-pending]` que o card lê com `:has()`. Assim qualquer link
 * do card (título ou foto) liga o mesmo `CardLoading`.
 */
export function LinkPending() {
  const { pending } = useLinkStatus();
  return pending ? <span data-pending hidden /> : null;
}

/**
 * Véu com spinner sobre o card (pai com `group relative`). A ficha não tem
 * `loading.tsx` (ver CLAUDE.md), então sem isso o clique não dá retorno e a
 * pessoa clica de novo. O atraso evita piscar quando a página abre rápido.
 */
export function CardLoading() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 z-20 hidden animate-[fade_200ms_ease-out_150ms_both] place-items-center bg-white/60 group-has-[[data-pending]]:grid"
    >
      <span className="size-8 animate-spin rounded-full border-[3px] border-brand/25 border-t-brand" />
    </span>
  );
}
