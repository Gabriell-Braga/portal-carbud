import { localMedia } from "./format";
import type { DealerSite, DealerSummary, SearchResult, Vehicle, VehicleDetail } from "./types";

/**
 * Cliente da API pública do painel Carbud.
 *
 * O banco (D1) é binding do Cloudflare e só existe dentro do painel, no
 * Webflow Cloud. O portal roda na Vercel e enxerga apenas estas rotas HTTP.
 */

export function panelUrl(): string {
  const raw = process.env.PANEL_URL?.trim();
  if (!raw) throw new Error("PANEL_URL não está definida (ex.: https://crm.carbud.com.br/app).");
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, "");
}

export function panelHeaders(): Record<string, string> {
  const key = process.env.SITES_API_KEY;
  return key ? { "x-sites-key": key } : {};
}

type Envelope<T> = { ok: true; data: T } | { ok: false; error: string };

async function get<T>(path: string, revalidate = 60): Promise<T | null> {
  const response = await fetch(`${panelUrl()}${path}`, {
    headers: panelHeaders(),
    next: { revalidate },
  });

  // HTML no lugar de JSON = PANEL_URL sem o mount path; falhar alto evita um 404 enganoso
  if (!(response.headers.get("content-type") ?? "").includes("json")) {
    throw new Error(`PANEL_URL parece errada: ${path} respondeu ${response.status} sem JSON.`);
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Painel respondeu ${response.status} em ${path}`);

  const payload = (await response.json()) as Envelope<T>;
  if (!payload.ok) throw new Error(payload.error);
  return payload.data;
}

function withLocalMedia<T extends Vehicle>(vehicle: T): T {
  return {
    ...vehicle,
    coverUrl: localMedia(vehicle.coverUrl),
    photos: vehicle.photos.map((photo) => ({
      ...photo,
      thumb: localMedia(photo.thumb) ?? photo.thumb,
      card: localMedia(photo.card) ?? photo.card,
      full: localMedia(photo.full) ?? photo.full,
    })),
  };
}

export type Query = Record<string, string | string[] | undefined>;

export function toSearchParams(query: Query): URLSearchParams {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) search.set(key, first);
  }
  return search;
}

export async function searchVehicles(query: Query = {}): Promise<SearchResult> {
  const qs = toSearchParams(query).toString();
  const data = await get<SearchResult>(`/api/public/portal/vehicles${qs ? `?${qs}` : ""}`);
  if (!data) throw new Error("Busca do portal indisponível no painel.");
  return { ...data, vehicles: data.vehicles.map(withLocalMedia) };
}

/** Loja pela vitrine pública dela; null quando não existe ou está fora do ar. */
export async function fetchDealer(slug: string): Promise<DealerSite | null> {
  const data = await get<DealerSite>(`/api/public/site/${encodeURIComponent(slug)}`);
  if (!data || !data.available) return null;
  return {
    ...data,
    site: { ...data.site, logoUrl: localMedia(data.site.logoUrl) },
  };
}

export async function fetchVehicle(dealer: string, slug: string): Promise<VehicleDetail | null> {
  const data = await get<VehicleDetail>(
    `/api/public/site/${encodeURIComponent(dealer)}/vehicles/${encodeURIComponent(slug)}`,
  );
  if (!data) return null;
  return { vehicle: withLocalMedia(data.vehicle), related: data.related.map(withLocalMedia) };
}

export async function listDealers(): Promise<DealerSummary[]> {
  const data = await get<{ dealers: DealerSummary[] }>("/api/public/portal/dealers");
  return (data?.dealers ?? []).map((dealer) => ({ ...dealer, logoUrl: localMedia(dealer.logoUrl) }));
}
