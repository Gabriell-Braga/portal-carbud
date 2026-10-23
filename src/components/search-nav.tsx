"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useTransition } from "react";
import { GridSkeleton } from "./skeletons";

const PendingContext = createContext(false);

/**
 * Filtrar sem recarregar: o formulário GET e os links da busca (chips,
 * limpar, paginação) viram navegação do Next dentro de uma transition. Os
 * filtros ficam na tela e só a lista vira esqueleto até os carros novos
 * chegarem. Clique em capture para passar na frente do `Link`. Sem JS, tudo
 * continua sendo formulário e link comuns.
 */
export function SearchNav({ path, className, children }: { path: string; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function go(url: URL, scroll: boolean) {
    startTransition(() => router.push(url.pathname + url.search, { scroll }));
  }

  function onSubmit(event: React.FormEvent) {
    const form = event.target as HTMLFormElement;
    if (form.method !== "get") return;
    event.preventDefault();
    const url = new URL(form.action);
    // campo vazio não vai para a URL; o servidor ainda canoniza o resto
    for (const [key, value] of new FormData(form)) if (value) url.searchParams.append(key, String(value));
    go(url, false);
  }

  function onClick(event: React.MouseEvent) {
    const link = (event.target as Element).closest("a");
    if (!link || link.target || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href);
    // só links da própria busca; o card do carro segue como navegação comum
    if (url.origin !== location.origin || !url.pathname.startsWith(path)) return;
    event.preventDefault();
    go(url, true);
  }

  return (
    <PendingContext.Provider value={pending}>
      <div className={className} onSubmit={onSubmit} onClickCapture={onClick}>
        {children}
      </div>
    </PendingContext.Provider>
  );
}

/** Lista de resultados: esqueleto enquanto a busca nova carrega. */
export function Pending({ children }: { children: React.ReactNode }) {
  return useContext(PendingContext) ? <div aria-busy="true" aria-label="Carregando"><GridSkeleton /></div> : children;
}
