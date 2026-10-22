/** Rótulos dos valores que o painel usa nos filtros (espelho de `@carbud/site-kit/catalog`). */
export const TRANSMISSION_LABELS: Record<string, string> = {
  manual: "Manual",
  automatico: "Automático",
  automatizado: "Automatizado",
  cvt: "CVT",
};

export const FUEL_LABELS: Record<string, string> = {
  flex: "Flex",
  gasolina: "Gasolina",
  etanol: "Etanol",
  diesel: "Diesel",
  gnv: "GNV",
  hibrido: "Híbrido",
  eletrico: "Elétrico",
};

export const BODY_TYPE_LABELS: Record<string, string> = {
  hatch: "Hatch",
  sedan: "Sedã",
  suv: "SUV",
  picape: "Picape",
  minivan: "Minivan",
  cupe: "Cupê",
  conversivel: "Conversível",
  utilitario: "Utilitário",
};

export const SORTS = [
  { value: "recentes", label: "Mais relevantes" },
  { value: "preco-asc", label: "Menor preço" },
  { value: "preco-desc", label: "Maior preço" },
  { value: "km-asc", label: "Menor km" },
  { value: "ano-desc", label: "Mais novos" },
];

/** Parâmetros que a busca entende — os mesmos do painel (`parsePublicFilters`) mais os do portal. */
export const FILTER_KEYS = [
  "q",
  "cidade",
  "uf",
  "loja",
  "marca",
  "modelo",
  "cambio",
  "combustivel",
  "carroceria",
  "precoMin",
  "precoMax",
  "anoMin",
  "anoMax",
  "kmMax",
  "abaixoFipe",
  "vistoriado",
  "visao360",
] as const;

const reais = (value: string) => `R$ ${Number(value).toLocaleString("pt-BR")}`;

/** Texto do chip de filtro aplicado. */
export function filterLabel(key: string, value: string): string {
  switch (key) {
    case "q":
      return `“${value}”`;
    case "cambio":
      return TRANSMISSION_LABELS[value] ?? value;
    case "combustivel":
      return FUEL_LABELS[value] ?? value;
    case "carroceria":
      return BODY_TYPE_LABELS[value] ?? value;
    case "precoMin":
      return `A partir de ${reais(value)}`;
    case "precoMax":
      return `Até ${reais(value)}`;
    case "anoMin":
      return `A partir de ${value}`;
    case "anoMax":
      return `Até ${value}`;
    case "kmMax":
      return `Até ${Number(value).toLocaleString("pt-BR")} km`;
    case "abaixoFipe":
      return "Abaixo da FIPE";
    case "vistoriado":
      return "Vistoriado";
    case "visao360":
      return "Visão 360°";
    default:
      return value;
  }
}
