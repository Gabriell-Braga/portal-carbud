"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Não conseguimos carregar agora</h1>
      <p className="mt-2 text-sm text-muted">Pode ser a conexão ou uma instabilidade rápida. Tente de novo em instantes.</p>
      <button onClick={reset} className="mt-6 min-h-12 w-full rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-hover">
        Tentar novamente
      </button>
    </div>
  );
}
