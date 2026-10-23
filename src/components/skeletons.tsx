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
