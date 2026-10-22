/**
 * Esqueleto da busca enquanto o painel responde (handoff 01: skeleton).
 *
 * Só aqui, não na raiz: com Suspense acima, a resposta sai 200 antes do
 * notFound() da ficha e da loja, e anúncio vendido seria indexado.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1240px] animate-pulse px-4 py-6 lg:px-6" aria-busy="true" aria-label="Carregando">
      <div className="h-8 w-2/3 max-w-md rounded-lg bg-subtle" />
      <div className="mt-2 h-4 w-1/3 max-w-xs rounded bg-subtle" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line">
            <div className="aspect-video bg-subtle" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-1/2 rounded bg-subtle" />
              <div className="h-3 w-1/3 rounded bg-subtle" />
              <div className="h-6 w-2/5 rounded bg-subtle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
