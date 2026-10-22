import { BODY_TYPE_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "~/lib/catalog";
import type { Facets } from "~/lib/types";
import { fieldBox } from "./field-box";
import { CityInput, MaskedInput, Select, type Option } from "./fields";

const bare = "h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted";

function Group({ title, htmlFor, children }: { title: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    // legend dentro de fieldset ignora o padding do topo; div + role="group" alinha igual em todo navegador
    <div role="group" aria-label={title} className="border-b border-line py-4 last:border-0">
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">{title}</label>
      {children}
    </div>
  );
}

/** Dois valores numa caixa só: "Mínimo até Máximo". */
function Pair({ children }: { children: React.ReactNode }) {
  return <div className={`${fieldBox} gap-2`}>{children}</div>;
}

const Until = () => <span className="text-muted" aria-hidden="true">até</span>;

/** Chaves do Figma; cada uma manda `nome=1` e o painel aplica a regra do selo. */
const SWITCHES = [
  ["abaixoFipe", "Abaixo da FIPE", "Ofertas com preço abaixo da tabela"],
  ["vistoriado", "Vistoriado", "Laudo e dados de vistoria disponíveis"],
  ["visao360", "Visão 360°", "Fotos imersivas quando disponíveis"],
] as const;

function options(values: string[], labels: Record<string, string>, all: string): Option[] {
  return [{ value: "", label: all }, ...values.map((value) => ({ value, label: labels[value] ?? value }))];
}

/**
 * Filtros da busca (Figma 03 · Desktop · Listagem). Formulário GET simples: a
 * URL é o estado (spec 02 do handoff), então voltar do anúncio e compartilhar
 * o link preservam tudo. `action` muda quando o mesmo formulário filtra o
 * estoque de uma loja. Versão, condição e vendedor do Figma ficam de fora até
 * o painel ter o dado.
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
    <form id="filtros" action={action} className="lg:rounded-2xl lg:border lg:border-line lg:bg-white lg:px-5 lg:pt-5 lg:pb-5">
      <div className="mb-1 hidden items-center justify-between lg:flex">
        <h2 className="font-display text-xl font-bold">Filtros</h2>
        <a href={action} className="text-sm font-semibold text-brand hover:text-brand-hover">Limpar</a>
      </div>

      {/* a busca por texto vem da home; o filtro só a preserva (o chip remove) */}
      {values.q && <input type="hidden" name="q" value={values.q} />}

      {!hideCity && (
        <Group title="Localização" htmlFor="f-cidade">
          <CityInput id="f-cidade" cities={facets.cities} defaultValue={values.cidade ?? ""} autoSubmit />
        </Group>
      )}

      <Group title="Marca">
        {/* trocar a marca reenvia, para a lista de modelos vir da marca nova */}
        <Select
          name="marca"
          label="Marca"
          placeholder="Selecionar marca"
          defaultValue={values.marca ?? ""}
          options={[{ value: "", label: "Todas as marcas" }, ...facets.brands.map((b) => ({ value: b.brand, label: b.brand }))]}
          autoSubmit
        />
      </Group>

      <Group title="Modelo">
        <Select
          name="modelo"
          label="Modelo"
          placeholder={models.length ? "Selecionar modelo" : "Escolha a marca antes"}
          defaultValue={values.modelo ?? ""}
          options={[{ value: "", label: "Todos os modelos" }, ...models.map((model) => ({ value: model, label: model }))]}
          disabled={!models.length}
        />
      </Group>

      <Group title="Ano" htmlFor="f-amin">
        <Pair>
          <MaskedInput mask="year" id="f-amin" name="anoMin" placeholder="Ano mínimo" aria-label="Ano mínimo" defaultValue={values.anoMin} className={bare} />
          <Until />
          <MaskedInput mask="year" name="anoMax" placeholder="Ano máximo" aria-label="Ano máximo" defaultValue={values.anoMax} className={bare} />
        </Pair>
      </Group>

      <Group title="Preço" htmlFor="f-pmin">
        <Pair>
          <MaskedInput mask="money" id="f-pmin" name="precoMin" placeholder="Mínimo" aria-label="Preço mínimo" defaultValue={values.precoMin} className={bare} />
          <Until />
          <MaskedInput mask="money" name="precoMax" placeholder="Máximo" aria-label="Preço máximo" defaultValue={values.precoMax} className={bare} />
        </Pair>
      </Group>

      <Group title="Quilometragem" htmlFor="f-km">
        <MaskedInput mask="km" id="f-km" name="kmMax" placeholder="KM máximo" defaultValue={values.kmMax} className={fieldBox} />
      </Group>

      <Group title="Câmbio">
        <Select name="cambio" label="Câmbio" placeholder="Todos" defaultValue={values.cambio ?? ""} options={options(facets.transmissions, TRANSMISSION_LABELS, "Todos")} />
      </Group>

      <Group title="Combustível">
        <Select name="combustivel" label="Combustível" placeholder="Todos" defaultValue={values.combustivel ?? ""} options={options(facets.fuels, FUEL_LABELS, "Todos")} />
      </Group>

      <Group title="Carroceria">
        <Select name="carroceria" label="Carroceria" placeholder="Todas" defaultValue={values.carroceria ?? ""} options={options(facets.bodyTypes, BODY_TYPE_LABELS, "Todas")} />
      </Group>

      {SWITCHES.map(([name, title, hint]) => (
        <div key={name} className="flex items-center justify-between gap-4 border-b border-line py-4 last:border-0">
          <label htmlFor={`f-${name}`} className="min-w-0">
            <span className="block text-sm font-semibold">{title}</span>
            <span className="mt-0.5 block text-xs text-muted">{hint}</span>
          </label>
          <input id={`f-${name}`} type="checkbox" name={name} value="1" defaultChecked={values[name] === "1"} className="switch" />
        </div>
      ))}

      {/* no desktop o FilterPanel filtra a cada mudança; sem botão de aplicar */}
      <div className="mt-2 hidden lg:block">
        <a href={action} className="flex h-11 w-full items-center justify-center rounded-lg border border-line text-sm font-semibold hover:border-ink">
          Limpar filtros
        </a>
      </div>
    </form>
  );
}
