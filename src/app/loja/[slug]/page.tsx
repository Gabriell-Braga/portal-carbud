import { BadgeCheck, MapPin, Phone, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Select } from "~/components/fields";
import { FilterPanel } from "~/components/filter-panel";
import { FiltersForm } from "~/components/filters-form";
import { EmptyResults, Pagination, VehicleGrid } from "~/components/results";
import { SORTS } from "~/lib/catalog";
import { place } from "~/lib/format";
import { fetchDealer, searchVehicles, toSearchParams, type Query } from "~/lib/panel";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Query> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dealer = await fetchDealer(slug);
  if (!dealer) return { title: "Loja não encontrada" };
  const city = dealer.site.contact.address.city;
  return {
    title: `Estoque da ${dealer.site.name}${city ? ` em ${city}` : ""}`,
    description: `Carros à venda na ${dealer.site.name}. Veja preços, fotos e fale direto com a loja.`,
    alternates: { canonical: `/loja/${slug}` },
  };
}

export default async function DealerPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const dealer = await fetchDealer(slug);
  if (!dealer) notFound();

  // a loja vem da rota, nunca da query: ?loja=outra não troca o estoque
  const { cidade: _cidade, uf: _uf, ...rest } = query;
  const result = await searchVehicles({ ...rest, loja: slug });
  const params2 = toSearchParams(rest);
  const values = Object.fromEntries(params2.entries());
  const base = `/loja/${slug}`;
  const { site } = dealer;
  const where = place(site.contact.address.city, site.contact.address.state);

  return (
    <div className="mx-auto max-w-[1240px] px-4 lg:px-6">
      <nav aria-label="Trilha" className="mt-4 text-xs text-muted">
        <Link href="/" className="hover:text-ink">Início</Link> / <Link href="/lojas" className="hover:text-ink">Lojas</Link> / <span>{site.name}</span>
      </nav>

      <header className="mt-4 flex flex-col gap-4 rounded-2xl border border-line p-5 sm:flex-row sm:items-center">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-subtle">
          {site.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.logoUrl} alt={site.name} className="h-full w-full object-contain p-1" />
          ) : (
            <Store className="size-8 text-muted" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
            {site.name} <BadgeCheck className="size-5 shrink-0 text-success" aria-label="Loja cadastrada no Carbud" />
          </h1>
          {site.contact.address.full && (
            <p className="mt-1 flex items-start gap-1 text-sm text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {site.contact.mapsUrl ? (
                <a href={site.contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ink">{site.contact.address.full}</a>
              ) : (
                site.contact.address.full
              )}
            </p>
          )}
          {site.contact.phone && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <Phone className="size-4" aria-hidden="true" /> {site.contact.phone}
            </p>
          )}
          {site.aboutText && <p className="mt-3 line-clamp-3 text-sm">{site.aboutText}</p>}
        </div>
      </header>

      <div className="mt-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="lg:sticky lg:top-24">
          <FilterPanel total={result.total}>
            <FiltersForm action={base} facets={result.facets} values={values} hideCity />
          </FilterPanel>
        </aside>

        <section aria-label="Estoque da loja" className="mt-4 min-w-0 lg:mt-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              {result.total} {result.total === 1 ? "veículo" : "veículos"} na {site.name}
              {where ? ` • ${where}` : ""}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted">
              Ordenar por
              <Select form="filtros" name="ordem" label="Ordenar por" placeholder="Mais recentes" defaultValue={values.ordem ?? "recentes"} options={SORTS} autoSubmit className="w-48" />
            </div>
          </div>
          <div className="mt-5">
            {result.vehicles.length ? (
              <>
                <VehicleGrid vehicles={result.vehicles} />
                <Pagination base={base} params={params2} page={result.page} pageSize={result.pageSize} total={result.total} />
              </>
            ) : (
              <EmptyResults clearHref={base} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
