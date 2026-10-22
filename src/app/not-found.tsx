import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <div className="size-20 rounded-full bg-brand-soft" aria-hidden="true" />
      <h1 className="mt-6 font-display text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-sm text-muted">
        O anúncio pode ter sido vendido ou retirado pela loja. Veja outras ofertas disponíveis.
      </p>
      <Link href="/comprar" className="mt-6 flex min-h-12 w-full items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-hover">
        Buscar veículos
      </Link>
    </div>
  );
}
