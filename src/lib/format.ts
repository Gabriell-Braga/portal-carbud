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
