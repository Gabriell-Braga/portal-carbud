import { SearchSkeleton } from "~/components/skeletons";

/**
 * Esqueleto da busca enquanto o painel responde (handoff 01: skeleton).
 *
 * Só aqui e em /lojas, não na raiz: com Suspense acima, a resposta sai 200
 * antes do notFound() da ficha e da loja, e anúncio vendido seria indexado.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1240px] animate-pulse px-4 lg:px-6" aria-busy="true" aria-label="Carregando">
      <div className="mt-4 h-3 w-32 rounded bg-subtle" />
      <div className="mt-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <div className="hidden lg:block" />
        <div>
          <div className="h-8 w-2/3 max-w-md rounded-lg bg-subtle" />
          <div className="mt-2 h-4 w-40 rounded bg-subtle" />
        </div>
      </div>
      <SearchSkeleton />
    </div>
  );
}
