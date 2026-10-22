export default function Loading() {
  return (
    <div className="mx-auto max-w-[1240px] animate-pulse px-4 lg:px-6" aria-busy="true" aria-label="Carregando">
      <div className="mt-6 h-8 w-56 rounded-lg bg-subtle" />
      <div className="mt-2 h-4 w-48 rounded bg-subtle" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-line p-5">
            <div className="size-16 shrink-0 rounded-xl bg-subtle" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-subtle" />
              <div className="h-3 w-1/2 rounded bg-subtle" />
              <div className="h-3 w-1/4 rounded bg-subtle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
