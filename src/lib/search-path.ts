import type { Facets } from "./types";

/**
 * Cidade, marca e modelo da busca viram caminho: /comprar/mg-belo-horizonte/gm-chevrolet/onix.
 *
 * É o formato dos portais grandes e o que o Google indexa; o resto dos filtros
 * segue na query. O slug não carrega o nome original (acento, "GM - Chevrolet"),
 * então quem lê o caminho volta ao nome pelo catálogo: cidade ou marca fora do
 * catálogo fica na query e nunca vira caminho.
 */

type Catalog = Pick<Facets, "brands" | "cities">;
export type SearchValues = Record<string, string | undefined>;

export function slug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** O painel manda "Cidade - UF"; o caminho fica "uf-cidade", como na Webmotors. */
function places(catalog: Catalog) {
  return catalog.cities.map((entry) => {
    const [city, state = ""] = entry.split(" - ");
    return { city, state, slug: slug(state ? `${state}-${city}` : city) };
  });
}

export function searchPath(values: SearchValues, catalog: Catalog): string {
  const rest = { ...values };
  const segments: string[] = [];

  const { cidade, uf, marca, modelo } = values;
  const place = cidade && places(catalog).find((p) => slug(p.city) === slug(cidade) && (!uf || slug(p.state) === slug(uf)));
  if (place) {
    segments.push(place.slug);
    delete rest.cidade;
    delete rest.uf;
  }

  const brand = marca && catalog.brands.find((b) => slug(b.brand) === slug(marca));
  if (brand) {
    segments.push(slug(brand.brand));
    delete rest.marca;
    const model = modelo && brand.models.find((m) => slug(m) === slug(modelo));
    if (model) {
      segments.push(slug(model));
      delete rest.modelo;
    }
  }

  const qs = new URLSearchParams(Object.entries(rest).filter((entry): entry is [string, string] => !!entry[1])).toString();
  return `/comprar${segments.map((s) => `/${s}`).join("")}${qs ? `?${qs}` : ""}`;
}

/** Caminho de volta para os valores da busca; null quando algum pedaço não existe no catálogo. */
export function parseSearchPath(segments: string[], catalog: Catalog): SearchValues | null {
  const values: SearchValues = {};
  const queue = [...segments];

  const place = places(catalog).find((p) => p.slug === queue[0]);
  if (place) {
    values.cidade = place.city;
    if (place.state) values.uf = place.state;
    queue.shift();
  }

  const brand = queue.length ? catalog.brands.find((b) => slug(b.brand) === queue[0]) : undefined;
  if (brand) {
    values.marca = brand.brand;
    queue.shift();
    const model = queue.length ? brand.models.find((m) => slug(m) === queue[0]) : undefined;
    if (model) {
      values.modelo = model;
      queue.shift();
    }
  }

  return queue.length ? null : values;
}
