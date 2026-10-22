/** "30130-010", "30130010" ou "30.130-010" viram "30130010"; qualquer outra coisa, null. */
export function cepDigits(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d{2}\.?\d{3}-?\d{3}$/.test(trimmed)) return null;
  return trimmed.replace(/\D/g, "");
}

/**
 * Cidade de um CEP pelo ViaCEP (gratuito, sem chave). A busca do painel
 * filtra por cidade, não por CEP; então o CEP só serve para achar a cidade.
 * Cache longo: CEP quase nunca muda de cidade.
 */
export async function cityFromCep(cep: string): Promise<{ city: string; state: string } | null> {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { next: { revalidate: 60 * 60 * 24 * 30 } }).catch(() => null);
  if (!response?.ok) return null;
  const data = (await response.json().catch(() => null)) as { localidade?: string; uf?: string; erro?: unknown } | null;
  if (!data || data.erro || !data.localidade) return null;
  return { city: data.localidade, state: data.uf ?? "" };
}
