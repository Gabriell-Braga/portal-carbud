import { ArrowRight, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { place } from "~/lib/format";
import { listDealers } from "~/lib/panel";

// renderiza na requisição: o build não depende do painel estar no ar; os dados seguem em cache (revalidate do fetch)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lojas",
  description: "Revendas de veículos com estoque no Carbud.",
  alternates: { canonical: "/lojas" },
};

export default async function DealersPage() {
  const dealers = await listDealers();

  return (
    <div className="mx-auto max-w-[1240px] px-4 lg:px-6">
      <h1 className="mt-6 font-display text-2xl font-bold lg:text-3xl">Lojas no Carbud</h1>
      <p className="mt-1 text-sm text-muted">
        {dealers.length} {dealers.length === 1 ? "loja com estoque publicado" : "lojas com estoque publicado"}
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dealers.map((dealer) => (
          <li key={dealer.slug}>
            <Link href={`/loja/${dealer.slug}`} className="flex h-full items-center gap-4 rounded-2xl border border-line p-5 hover:shadow-md">
              <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-subtle">
                {dealer.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={dealer.logoUrl} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                ) : (
                  <Store className="size-7 text-muted" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold">{dealer.name}</p>
                <p className="text-xs text-muted">{place(dealer.city, dealer.state) ?? "Localização não informada"}</p>
                <p className="mt-1 text-xs font-semibold text-brand">
                  {dealer.vehicles} {dealer.vehicles === 1 ? "veículo" : "veículos"}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
