import { BODY_TYPE_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "~/lib/catalog";
import type { Facets } from "~/lib/types";
import { AutoSubmitSelect } from "./filter-panel";

const input =
  "h-11 w-full min-w-0 rounded-lg border border-line bg-white px-3 text-sm outline-none placeholder:text-muted focus:border-ink";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    // legend dentro de fieldset ignora o padding do topo; div + role="group" alinha igual em todo navegador
    <div role="group" aria-label={title} className="border-b border-line py-4 first:pt-0 last:border-0">
      <p className="mb-2 text-sm font-semibold" aria-hidden="true">{title}</p>
      {children}
    </div>
  );
}

function Options({ values, labels }: { values: string[]; labels: Record<string, string> }) {
  return values.map((value) => (
    <option key={value} value={value}>
      {labels[value] ?? value}
    </option>
  ));
}

/**
 * Filtros da busca. Formulário GET simples: a URL é o estado (spec 02 do
 * handoff), então voltar do anúncio e compartilhar o link preservam tudo.
 * `action` muda quando o mesmo formulário filtra o estoque de uma loja.
 */
export function FiltersForm({
  action,
  facets,
  values,
  hideCity = false,
}: {
  action: string;
  facets: Facets;
  values: Record<string, string | undefined>;
  hideCity?: boolean;
}) {
  const models = facets.brands.find((b) => b.brand === values.marca)?.models ?? [];

  return (
    <form id="filtros" action={action} className="lg:rounded-2xl lg:border lg:border-line lg:p-5">
      <div className="mb-4 hidden items-center justify-between lg:flex">
        <h2 className="font-display text-lg font-bold">Filtros</h2>
        <a href={action} className="text-sm font-semibold text-brand">Limpar</a>
      </div>

      {/* a ordenação fica fora do painel, ligada a este form por `form="filtros"` */}
      <Group title="Busca">
        <label className="sr-only" htmlFor="f-q">Marca, modelo ou palavra-chave</label>
        <input id="f-q" name="q" type="search" placeholder="Marca, modelo ou palavra-chave" defaultValue={values.q} className={input} />
      </Group>

      {!hideCity && (
        <Group title="Localização">
          <label className="sr-only" htmlFor="f-cidade">Cidade</label>
          <AutoSubmitSelect id="f-cidade" name="cidade" defaultValue={values.cidade ?? ""} className={input}>
            <option value="">Todas as cidades</option>
            {facets.cities.map((city) => {
              const name = city.split(" - ")[0];
              return <option key={city} value={name}>{city}</option>;
            })}
          </AutoSubmitSelect>
        </Group>
      )}

      <Group title="Marca e modelo">
        <div className="grid grid-cols-1 gap-2">
          <label className="sr-only" htmlFor="f-marca">Marca</label>
          {/* trocar a marca reenvia, para a lista de modelos vir da marca nova */}
          <AutoSubmitSelect id="f-marca" name="marca" defaultValue={values.marca ?? ""} className={input}>
            <option value="">Selecionar marca</option>
            {facets.brands.map((b) => <option key={b.brand} value={b.brand}>{b.brand}</option>)}
          </AutoSubmitSelect>
          <label className="sr-only" htmlFor="f-modelo">Modelo</label>
          <select id="f-modelo" name="modelo" defaultValue={values.modelo ?? ""} disabled={!models.length} className={`${input} disabled:bg-subtle`}>
            <option value="">{models.length ? "Selecionar modelo" : "Escolha a marca antes"}</option>
            {models.map((model) => <option key={model} value={model}>{model}</option>)}
          </select>
        </div>
      </Group>

      <Group title="Preço">
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="f-pmin">Preço mínimo</label>
          <input id="f-pmin" name="precoMin" inputMode="numeric" placeholder="Mínimo" defaultValue={values.precoMin} className={input} />
          <label className="sr-only" htmlFor="f-pmax">Preço máximo</label>
          <input id="f-pmax" name="precoMax" inputMode="numeric" placeholder="Máximo" defaultValue={values.precoMax} className={input} />
        </div>
      </Group>

      <Group title="Ano">
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="f-amin">Ano mínimo</label>
          <input id="f-amin" name="anoMin" inputMode="numeric" placeholder="De" defaultValue={values.anoMin} className={input} />
          <label className="sr-only" htmlFor="f-amax">Ano máximo</label>
          <input id="f-amax" name="anoMax" inputMode="numeric" placeholder="Até" defaultValue={values.anoMax} className={input} />
        </div>
      </Group>

      <Group title="Quilometragem">
        <label className="sr-only" htmlFor="f-km">Quilometragem máxima</label>
        <input id="f-km" name="kmMax" inputMode="numeric" placeholder="Km máximo" defaultValue={values.kmMax} className={input} />
      </Group>

      <Group title="Câmbio">
        <label className="sr-only" htmlFor="f-cambio">Câmbio</label>
        <select id="f-cambio" name="cambio" defaultValue={values.cambio ?? ""} className={input}>
          <option value="">Todos</option>
          <Options values={facets.transmissions} labels={TRANSMISSION_LABELS} />
        </select>
      </Group>

      <Group title="Combustível">
        <label className="sr-only" htmlFor="f-comb">Combustível</label>
        <select id="f-comb" name="combustivel" defaultValue={values.combustivel ?? ""} className={input}>
          <option value="">Todos</option>
          <Options values={facets.fuels} labels={FUEL_LABELS} />
        </select>
      </Group>

      <Group title="Carroceria">
        <label className="sr-only" htmlFor="f-carroceria">Carroceria</label>
        <select id="f-carroceria" name="carroceria" defaultValue={values.carroceria ?? ""} className={input}>
          <option value="">Todas</option>
          <Options values={facets.bodyTypes} labels={BODY_TYPE_LABELS} />
        </select>
      </Group>

      <button className="mt-2 hidden h-11 w-full rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-hover lg:block">
        Aplicar filtros
      </button>
    </form>
  );
}
