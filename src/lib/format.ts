const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const NUMBER = new Intl.NumberFormat("pt-BR");

/** "R$ 139.900", sem centavos: é como o Figma e os portais mostram preço de carro. */
export function price(cents: number, onRequest = false): string {
  if (onRequest || cents <= 0) return "Sob consulta";
  // Intl usa espaço não separável depois do "R$"; troca por espaço comum para comparar e copiar
  return BRL.format(Math.round(cents / 100)).replace(/ /g, " ");
}

export function km(value: number): string {
  return `${NUMBER.format(value)} km`;
}

export function place(city: string | null, state: string | null): string | null {
  if (!city) return state;
  return state ? `${city} - ${state}` : city;
}

/**
 * Traz as fotos para o domínio do portal.
 *
 * O painel monta `/<mount>/api/media/<chave>`; aqui isso vira `/media/<chave>`,
 * que o `rewrites()` encaminha ao painel. Mesma regra do app dos sites: o corte
 * é na última ocorrência de `/api/media/`, então o mount path some junto.
 */
export function localMedia(url: string | null): string | null {
  if (!url) return null;
  const cut = url.lastIndexOf("/api/media/");
  return cut < 0 ? url : `/media/${url.slice(cut + "/api/media/".length)}`;
}

/** Só dígitos, com DDI 55 quando faltar — o que o wa.me exige. */
export function whatsappLink(digits: string | null, text: string): string | null {
  const only = (digits ?? "").replace(/\D/g, "");
  if (only.length < 10) return null;
  const full = only.startsWith("55") && only.length >= 12 ? only : `55${only}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

/* Máscaras dos campos. Recebem o que a pessoa digitou e devolvem o texto da tela. */

export const digits = (value: string) => value.replace(/\D/g, "");

/** "150000" → "R$ 150.000"; vazio fica vazio para o placeholder aparecer. */
export function maskMoney(value: string): string {
  const only = digits(value).replace(/^0+/, "").slice(0, 10);
  return only ? `R$ ${NUMBER.format(Number(only))}` : "";
}

/** "50000" → "50.000 km". */
export function maskKm(value: string): string {
  const only = digits(value).replace(/^0+/, "").slice(0, 7);
  return only ? `${NUMBER.format(Number(only))} km` : "";
}

/** Celular com 9 dígitos ou fixo com 8: "(31) 99999-0000" / "(31) 3333-0000". */
export function maskPhone(value: string): string {
  const d = digits(value).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  const split = d.length > 10 ? 7 : 6;
  return d.length <= split ? `(${d.slice(0, 2)}) ${d.slice(2)}` : `(${d.slice(0, 2)}) ${d.slice(2, split)}-${d.slice(split)}`;
}

/** Só aplica a máscara de CEP quando o texto é só número: "Belo Horizonte" passa intacto. */
export function maskCityOrCep(value: string): string {
  if (!/^[\d.\-\s]+$/.test(value)) return value;
  const d = digits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}
