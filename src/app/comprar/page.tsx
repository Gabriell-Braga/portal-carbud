import { X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Select } from "~/components/fields";
import { FilterPanel } from "~/components/filter-panel";
import { FiltersForm } from "~/components/filters-form";
import { EmptyResults, Pagination, VehicleGrid, withParam } from "~/components/results";
import { FILTER_KEYS, SORTS, filterLabel } from "~/lib/catalog";
import { cityFromCep, cepDigits } from "~/lib/cep";
import { searchVehicles, toSearchParams, type Query } from "~/lib/panel";

type Props = { searchParams: Promise<Query> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = await searchParams;
  const city = typeof query.cidade === "string" ? query.cidade : null;
  const brand = typeof query.marca === "string" ? query.marca : null;
  const subject = [brand, "carros usados e seminovos"].filter(Boolean).join(" ");
  return {
    title: city ? `${subject} em ${city}` : subject.charAt(0).toUpperCase() + subject.slice(1),
    alternates: { canonical: "/comprar" },
    // combinação de filtros não é página para indexar; a listagem limpa é
    robots: Object.keys(query).length ? { index: false, follow: true } : undefined,
  };
}

export default async function BuyPage({ searchParams }: Props) {
  const query = await searchParams;
  const params = toSearchParams(query);
  const values = Object.fromEntries(params.entries());

  // "Cidade ou CEP": CEP vira a cidade dele, e a URL passa a mostrar a cidade
  const cep = cepDigits(values.cidade);
  if (cep) {
    const found = await cityFromCep(cep);
    if (found) {
      params.set("cidade", found.city);
      if (found.state) params.set("uf", found.state);
      redirect(`/comprar?${params}`);
    }
  }

  const result = await searchVehicles(query);

  const applied = FILTER_KEYS.filter((key) => values[key] && key !== "loja");
  const where = values.cidade ? ` em ${values.cidade}` : "";

  return (
    <div className="mx-auto max-w-[1240px] px-4 lg:px-6">
      <nav aria-label="Trilha" className="mt-4 text-xs text-muted">
        <Link href="/" className="hover:text-ink">Início</Link> / <span>Comprar</span>
      </nav>

      <div className="mt-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <div className="hidden lg:block" />
        <header>
          <h1 className="font-display text-2xl font-bold lg:text-3xl">Carros usados e seminovos à venda</h1>
          <p className="mt-1 text-sm text-muted">
            {result.total.toLocaleString("pt-BR")} {result.total === 1 ? "veículo disponível" : "veículos disponíveis"}
            {where}
          </p>
        </header>
      </div>

      <div className="mt-5 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="lg:sticky lg:top-24">
          <FilterPanel total={result.total}>
            <FiltersForm action="/comprar" facets={result.facets} values={values} />
          </FilterPanel>
        </aside>

        {/* Figma 03 · Listagem: contagem, ordenação, filtros aplicados e grade num cartão só */}
        <section aria-label="Resultados" className="mt-4 min-w-0 lg:mt-0 lg:rounded-2xl lg:border lg:border-line lg:bg-white lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-base font-bold">
              {result.total.toLocaleString("pt-BR")} {result.total === 1 ? "anúncio encontrado" : "anúncios encontrados"}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              Ordenar por
              <Select form="filtros" name="ordem" label="Ordenar por" placeholder="Mais relevantes" defaultValue={values.ordem ?? "recentes"} options={SORTS} autoSubmit className="w-48" />
            </div>
          </div>

          {applied.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <span className="mr-1 text-xs text-muted">Filtros aplicados</span>
              {applied.map((key, index) => (
                <Link
                  key={key}
                  href={withParam("/comprar", params, key, null)}
                  aria-label={`Remover filtro ${filterLabel(key, values[key]!)}`}
                  className={`inline-flex min-h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold ${
                    index === 0 ? "bg-brand text-white hover:bg-brand-hover" : "border border-line bg-white hover:border-brand hover:text-brand"
                  }`}
                >
                  {filterLabel(key, values[key]!)}
                  <X className="size-3" aria-hidden="true" />
                </Link>
              ))}
              <Link href="/comprar" className="ml-auto text-xs font-semibold text-brand hover:text-brand-hover">Limpar todos</Link>
            </div>
          )}

          <h2 className="mt-6 mb-3 text-sm font-semibold">Carros usados e seminovos</h2>
          {result.vehicles.length ? (
            <>
              <VehicleGrid vehicles={result.vehicles} />
              <Pagination base="/comprar" params={params} page={result.page} pageSize={result.pageSize} total={result.total} />
            </>
          ) : (
            <EmptyResults clearHref="/comprar" />
          )}
        </section>
      </div>
    </div>
  );
}
