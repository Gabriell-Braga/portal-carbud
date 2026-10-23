import { X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Select } from "~/components/fields";
import { FilterPanel } from "~/components/filter-panel";
import { FiltersForm } from "~/components/filters-form";
import { Pending, SearchNav } from "~/components/search-nav";
import { EmptyResults, Pagination, VehicleGrid } from "~/components/results";
import { FILTER_KEYS, SORTS, filterLabel } from "~/lib/catalog";
import { cityFromCep, cepDigits } from "~/lib/cep";
import { searchVehicles, toSearchParams, type Query } from "~/lib/panel";
import { parseSearchPath, searchPath, type SearchValues } from "~/lib/search-path";

type Props = { params: Promise<{ filtros?: string[] }>; searchParams: Promise<Query> };

/** Caminho (cidade, marca, modelo) + query; a query vence, porque é o que o formulário acabou de mandar. */
async function resolve({ params, searchParams }: Props) {
  // busca sem filtro só pelo catálogo: é por ele que o slug do caminho volta ao nome
  const [{ filtros = [] }, query, catalog] = await Promise.all([params, searchParams, searchVehicles().then((r) => r.facets)]);
  const fromPath = parseSearchPath(filtros, catalog);
  const values: SearchValues | null = fromPath && { ...fromPath, ...Object.fromEntries(toSearchParams(query)) };
  return { filtros, query, catalog, values };
}

function heading(values: SearchValues) {
  const what = [values.marca, values.modelo].filter(Boolean).join(" ");
  const text = what ? `${what} usados e seminovos` : "Carros usados e seminovos";
  return values.cidade ? `${text} em ${values.cidade}` : text;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { values, catalog, query } = await resolve(props);
  if (!values) return {};
  const [path] = searchPath(values, catalog).split("?");
  return {
    title: heading(values),
    alternates: { canonical: path },
    // cidade/marca/modelo no caminho são páginas para indexar; o resto dos filtros não
    robots: Object.keys(query).length ? { index: false, follow: true } : undefined,
  };
}

export default async function BuyPage(props: Props) {
  const { filtros, query, catalog, values: resolved } = await resolve(props);
  if (!resolved) notFound();
  const values = resolved;

  // "Cidade ou CEP": CEP vira a cidade dele, e a URL passa a mostrar a cidade
  const cep = cepDigits(values.cidade);
  if (cep) {
    const found = await cityFromCep(cep);
    if (found) {
      values.cidade = found.city;
      if (found.state) values.uf = found.state;
    }
  }

  // o formulário manda GET para /comprar; aqui a busca vai para o endereço canônico, sem campo vazio nem ordem padrão
  if (values.ordem === "recentes") delete values.ordem;
  const canonical = searchPath(values, catalog);
  const raw = new URLSearchParams(Object.entries(query).flatMap(([key, value]) => [value ?? ""].flat().map((v) => [key, v]))).toString();
  const current = `/comprar${filtros.map((s) => `/${s}`).join("")}${raw ? `?${raw}` : ""}`;
  if (canonical !== current) redirect(canonical);

  const result = await searchVehicles(values);
  // navegação sem recarregar mantém os campos montados; a chave os refaz com a busca nova (chip removido, limpar)
  const state = JSON.stringify(values);

  const [base, qs = ""] = canonical.split("?");
  const applied = FILTER_KEYS.filter((key) => values[key] && key !== "loja");
  const without = (key: string) => searchPath({ ...values, [key]: undefined, ...(key === "marca" && { modelo: undefined }), ...(key === "cidade" && { uf: undefined }), pagina: undefined }, catalog);
  const where = values.cidade ? ` em ${values.cidade}` : "";
  const trail = [
    values.cidade && { label: values.cidade, href: searchPath({ cidade: values.cidade, uf: values.uf }, catalog) },
    values.marca && { label: values.marca, href: searchPath({ cidade: values.cidade, uf: values.uf, marca: values.marca }, catalog) },
    values.modelo && { label: values.modelo, href: searchPath({ cidade: values.cidade, uf: values.uf, marca: values.marca, modelo: values.modelo }, catalog) },
  ].filter((item) => !!item);

  return (
    <div className="mx-auto max-w-[1240px] px-4 lg:px-6">
      <nav aria-label="Trilha" className="mt-4 text-xs text-muted">
        <Link href="/" className="hover:text-ink">Início</Link> / <Link href="/comprar" className="hover:text-ink">Comprar</Link>
        {trail.map((item) => (
          <span key={item.href}>
            {" "}/ <Link href={item.href} className="hover:text-ink">{item.label}</Link>
          </span>
        ))}
      </nav>

      <div className="mt-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <div className="hidden lg:block" />
        <header>
          <h1 className="font-display text-2xl font-bold lg:text-3xl">{heading(values)} à venda</h1>
          <p className="mt-1 text-sm text-muted">
            {result.total.toLocaleString("pt-BR")} {result.total === 1 ? "veículo disponível" : "veículos disponíveis"}
            {where}
          </p>
        </header>
      </div>

      <SearchNav path="/comprar" catalog={{ brands: catalog.brands, cities: catalog.cities }} className="mt-5 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside>
          <FilterPanel total={result.total}>
            <FiltersForm key={state} action="/comprar" facets={result.facets} values={values} />
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
              <Select key={state} form="filtros" name="ordem" label="Ordenar por" placeholder="Mais relevantes" defaultValue={values.ordem ?? "recentes"} options={SORTS} autoSubmit className="w-48" />
            </div>
          </div>

          {applied.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <span className="mr-1 text-xs text-muted">Filtros aplicados</span>
              {applied.map((key, index) => (
                <Link
                  key={key}
                  href={without(key)}
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

          <Pending className="mt-6">
          {/* faixa de destaques só na vitrine: página 1, "Mais relevantes" e nenhum filtro */}
          {result.page === 1 && !values.ordem && !FILTER_KEYS.some((key) => values[key]) && !!result.highlights?.length && (
            <>
              <h2 className="mt-6 mb-3 text-sm font-semibold">Destaques</h2>
              <VehicleGrid vehicles={result.highlights} />
            </>
          )}

          <h2 className="mt-6 mb-3 text-sm font-semibold">Carros usados e seminovos</h2>
          {result.vehicles.length ? (
            <>
              {/* destaque só vale na faixa de cima (3, em rodízio); na lista é anúncio como outro qualquer */}
              <VehicleGrid vehicles={result.vehicles.map((v) => ({ ...v, featured: false }))} />
              <Pagination base={base} params={new URLSearchParams(qs)} page={result.page} pageSize={result.pageSize} total={result.total} />
            </>
          ) : (
            <EmptyResults clearHref="/comprar" />
          )}
          </Pending>
        </section>
      </SearchNav>
    </div>
  );
}
