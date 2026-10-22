import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CarArt } from "~/components/car-art";
import { CardPhotos } from "~/components/card-photos";
import { CityInput, Select } from "~/components/fields";
import { CardLoading, LinkPending } from "~/components/link-pending";
import { PriceRange } from "~/components/price-range";
import { vehicleHref } from "~/components/vehicle-card";
import { km, price } from "~/lib/format";
import { searchVehicles } from "~/lib/panel";

// renderiza na requisição: o build não depende do painel estar no ar; os dados seguem em cache (revalidate do fetch)
export const dynamic = "force-dynamic";

const QUICK = [
  { label: "SUVs até R$ 150 mil", href: "/comprar?carroceria=suv&precoMax=150000" },
  { label: "Até R$ 100 mil", href: "/comprar?precoMax=100000" },
  { label: "Automáticos", href: "/comprar?cambio=automatico" },
  { label: "Elétricos", href: "/comprar?combustivel=eletrico" },
  { label: "Híbridos", href: "/comprar?combustivel=hibrido" },
];

const BUDGETS = [
  { label: "Até R$ 80 mil", href: "/comprar?precoMax=80000" },
  { label: "Até R$ 120 mil", href: "/comprar?precoMax=120000" },
  { label: "Até R$ 160 mil", href: "/comprar?precoMax=160000" },
  { label: "Acima de R$ 160 mil", href: "/comprar?precoMin=160000" },
];

const CATEGORIES = [
  { label: "SUV", param: "carroceria=suv", count: (c: Counts) => c.bodyTypes.suv },
  { label: "Hatch", param: "carroceria=hatch", count: (c: Counts) => c.bodyTypes.hatch },
  { label: "Sedã", param: "carroceria=sedan", count: (c: Counts) => c.bodyTypes.sedan },
  { label: "Picape", param: "carroceria=picape", count: (c: Counts) => c.bodyTypes.picape },
  { label: "Elétricos", param: "combustivel=eletrico", count: (c: Counts) => c.fuels.eletrico },
];

type Counts = { bodyTypes: Record<string, number>; fuels: Record<string, number> };

const JOURNEYS = [
  { title: "Encontre por orçamento", text: "Veja veículos na sua faixa de preço", href: "#orcamento" },
  { title: "Explore por carroceria", text: "SUV, hatch, sedã, picape e mais", href: "#categorias" },
  { title: "Converse com o vendedor", text: "Mensagem e WhatsApp direto com a loja", href: "/comprar" },
];

const field =
  "h-12 w-full min-w-0 rounded-lg border border-line bg-white px-4 text-sm outline-none placeholder:text-muted focus:border-ink";

export default async function HomePage() {
  const { vehicles, facets, total } = await searchVehicles();
  const showcase = vehicles.slice(0, 3);

  return (
    <div className="mx-auto max-w-[1240px] px-4 lg:px-6">
      <section className="mt-4 rounded-2xl border border-line p-4 lg:mt-6 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Encontre seu carro</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight lg:text-4xl">
          Seu próximo carro começa aqui.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted lg:text-base">
          Compare veículos, encontre boas ofertas e converse diretamente com quem está vendendo.
        </p>

        <form action="/comprar" className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="sr-only" htmlFor="busca-q">Marca, modelo ou palavra-chave</label>
          <input id="busca-q" name="q" placeholder="Marca, modelo ou palavra-chave" className={field} />
          <label className="sr-only" htmlFor="busca-cidade">Cidade ou CEP</label>
          <CityInput id="busca-cidade" cities={facets.cities} inputClassName="h-12 px-4" />
          <Select
            name="precoMax"
            label="Faixa de preço"
            placeholder="Qualquer valor"
            options={[{ value: "", label: "Qualquer valor" }, ...[50, 80, 100, 150, 200, 300].map((mil) => ({ value: String(mil * 1000), label: `Até R$ ${mil} mil` }))]}
            className="[&>button]:h-12 [&>button]:px-4"
          />
          <button className="h-12 rounded-lg bg-brand px-8 text-sm font-semibold text-white hover:bg-brand-hover">
            Buscar veículos
          </button>
        </form>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-muted lg:sr-only">Buscas rápidas</p>
          <ul className="flex flex-wrap gap-2">
            {QUICK.map((chip) => (
              <li key={chip.label}>
                <Link href={chip.href} className="inline-flex min-h-9 items-center rounded-full border border-line px-4 text-xs font-medium hover:border-brand hover:text-brand">
                  {chip.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {showcase.length > 0 && (
          <div className="mt-8">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-base font-semibold">Oportunidades para começar sua busca</h2>
              <Link href="/comprar" className="shrink-0 text-xs text-muted hover:text-brand">
                Ver {total} {total === 1 ? "oferta" : "ofertas"} →
              </Link>
            </div>
            {/* mobile: carrossel com o próximo card aparecendo; desktop: três lado a lado */}
            <ul className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
              {showcase.map((vehicle, index) => (
                <li key={vehicle.id} className="w-[78%] shrink-0 snap-start lg:w-auto">
                  <article className="group relative overflow-hidden rounded-xl border border-line transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg has-[[data-pending]]:pointer-events-none">
                    <div className="relative aspect-[4/3] overflow-hidden bg-subtle">
                      <CardPhotos photos={vehicle.photos} cover={vehicle.coverUrl} title={vehicle.title} seed={vehicle.id} href={vehicleHref(vehicle)} priority={index === 0} />
                    </div>
                    <div className="flex items-start justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {/* o link cobre o card; o carrossel fica acima dele */}
                          <Link href={vehicleHref(vehicle)} className="after:absolute after:inset-0 group-hover:text-brand">
                            {vehicle.brand} {vehicle.model}
                            <LinkPending />
                          </Link>
                        </p>
                        <p className="text-xs text-muted">{vehicle.yearModel} • {km(vehicle.mileageKm)}</p>
                      </div>
                      <p className="shrink-0 font-display text-sm font-bold">{price(vehicle.priceCents, vehicle.priceOnRequest)}</p>
                    </div>
                    <CardLoading />
                  </article>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-label="Caminhos para encontrar seu carro" className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold lg:sr-only">Caminhos para encontrar seu carro</h2>
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
          {JOURNEYS.map((item) => (
            <li key={item.title}>
              <Link href={item.href} className="group flex items-start justify-between gap-3 rounded-xl border border-line border-l-4 border-l-brand p-4 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg lg:border-l lg:border-l-line lg:p-5">
                <span>
                  <span className="block font-display font-semibold">{item.title}</span>
                  <span className="mt-1 block text-xs text-muted">{item.text}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-brand transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="orcamento" className="mt-8 scroll-mt-24 rounded-2xl bg-subtle p-4 lg:p-8">
        <h2 className="font-display text-xl font-bold lg:text-2xl">Encontre carros dentro do seu orçamento</h2>
        <p className="mt-1 text-sm text-muted">Defina um valor e descubra oportunidades que combinam com o que você procura.</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {BUDGETS.map((chip) => (
            <li key={chip.label}>
              <Link href={chip.href} className="inline-flex min-h-9 items-center rounded-full border border-line bg-white px-4 text-xs font-medium hover:border-brand hover:bg-brand hover:text-white">
                {chip.label}
              </Link>
            </li>
          ))}
        </ul>
        <form action="/comprar" className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <p className="col-span-2 text-xs font-semibold lg:col-span-4">Faixa de preço</p>
          <PriceRange min={facets.priceRange.min / 100} max={facets.priceRange.max / 100} className={field}>
            <button className="col-span-2 h-12 rounded-lg bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-hover lg:col-span-1">
              Ver carros no orçamento
            </button>
          </PriceRange>
        </form>
      </section>

      <section id="categorias" className="mt-10 scroll-mt-24">
        <h2 className="font-display text-xl font-bold lg:text-2xl">Explore por categoria</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {CATEGORIES.map((category) => {
            const count = category.count(facets.counts) ?? 0;
            return (
              <li key={category.label}>
                <Link href={`/comprar?${category.param}`} className="group block overflow-hidden rounded-xl border border-line transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                  <div className="aspect-[16/10] overflow-hidden">
                    <CarArt seed={category.label} className="transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold transition-colors group-hover:text-brand">{category.label}</p>
                    <p className="text-xs text-muted">
                      {count} {count === 1 ? "veículo" : "veículos"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

    </div>
  );
}
