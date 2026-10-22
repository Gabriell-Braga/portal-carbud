/** Blocos de carregamento com o mesmo desenho das peças reais, para a página não pular quando os dados chegam. */

const bone = "rounded bg-subtle";

export function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line">
      <div className="aspect-[4/3] bg-subtle" />
      <div className="flex flex-col p-4">
        <div className={`h-4 w-1/2 ${bone}`} />
        <div className={`mt-2 h-3 w-3/4 ${bone}`} />
        <div className={`mt-4 h-4 w-2/3 ${bone}`} />
        <div className={`mt-3 h-4 w-1/2 ${bone}`} />
        <div className={`mt-5 h-7 w-2/5 ${bone}`} />
        <div className="mt-4 h-12 rounded-xl bg-subtle" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

/** Lateral de filtros no desktop; no mobile, só o botão "Filtrar". */
export function FiltersSkeleton() {
  return (
    <>
      <div className="h-11 w-28 rounded-lg bg-subtle lg:hidden" />
      <div className="hidden rounded-2xl border border-line p-5 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <div className={`h-6 w-20 ${bone}`} />
          <div className={`h-4 w-12 ${bone}`} />
        </div>
        {[1, 1, 2, 2, 2, 1, 1, 1].map((cols, i) => (
          <div key={i} className="border-b border-line py-4 first:pt-0 last:border-0">
            <div className={`mb-2 h-4 w-24 ${bone}`} />
            <div className={`grid gap-2 ${cols === 2 ? "grid-cols-2" : ""}`}>
              {Array.from({ length: cols }, (_, j) => <div key={j} className="h-11 rounded-lg border border-line" />)}
            </div>
          </div>
        ))}
        <div className="mt-2 h-11 rounded-lg bg-subtle" />
      </div>
    </>
  );
}

/** Mesma grade da busca e da loja: filtros à esquerda, barra de resultados e cards à direita. */
export function SearchSkeleton() {
  return (
    <div className="mt-5 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">
      <FiltersSkeleton />
      <div className="mt-4 lg:mt-0">
        <div className="flex items-center justify-between gap-3">
          <div className={`h-5 w-40 ${bone}`} />
          <div className="h-10 w-48 rounded-lg border border-line" />
        </div>
        <div className="mt-5">
          <GridSkeleton />
        </div>
      </div>
    </div>
  );
}
