"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useTransition } from "react";
import { searchPath, type SearchValues } from "~/lib/search-path";
import type { Facets } from "~/lib/types";
import { GridSkeleton } from "./skeletons";

const PendingContext = createContext(false);

/**
 * Filtrar sem recarregar: o formulário GET e os links da busca (chips,
 * limpar, paginação) viram navegação do Next dentro de uma transition. Os
 * filtros ficam na tela e só a lista vira esqueleto até os carros novos
 * chegarem. Clique em capture para passar na frente do `Link`. Sem JS, tudo
 * continua sendo formulário e link comuns.
 *
 * O Next só segura a tela antiga quando já tem a página inteira: por isso o
 * prefetch "full" antes do push e, com `catalog`, o endereço canônico montado
 * aqui. Um redirect no meio (/comprar?marca=X → /comprar/x) deixa o <main>
 * vazio e a rolagem no topo até a resposta chegar.
 */
export function SearchNav({
  path,
  catalog,
  className,
  children,
}: {
  path: string;
  catalog?: Pick<Facets, "brands" | "cities">;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function go(href: string, scroll: boolean) {
    // PrefetchKind.FULL; o enum é interno do Next
    router.prefetch(href, { kind: "full" as never });
    startTransition(() => router.push(href, { scroll }));
  }

  function onSubmit(event: React.FormEvent) {
    const form = event.target as HTMLFormElement;
    if (form.method !== "get") return;
    event.preventDefault();
    const values: SearchValues = {};
    for (const [key, value] of new FormData(form)) if (value) values[key] = String(value);
    // mesma canonização da página (ordem padrão fora da URL); CEP ainda passa pelo redirect do servidor
    if (values.ordem === "recentes") delete values.ordem;
    const url = new URL(form.action);
    go(catalog ? searchPath(values, catalog) : `${url.pathname}?${new URLSearchParams(values as Record<string, string>)}`, false);
  }

  function onClick(event: React.MouseEvent) {
    const link = (event.target as Element).closest("a");
    if (!link || link.target || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href);
    // só links da própria busca; o card do carro segue como navegação comum
    if (url.origin !== location.origin || !url.pathname.startsWith(path)) return;
    event.preventDefault();
    go(url.pathname + url.search, true);
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
export function Pending({ className, children }: { className?: string; children: React.ReactNode }) {
  return useContext(PendingContext) ? <div aria-busy="true" aria-label="Carregando" className={className}><GridSkeleton /></div> : children;
}
