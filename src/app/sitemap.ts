import type { MetadataRoute } from "next";
import { listDealers, searchVehicles } from "~/lib/panel";
import { siteUrl } from "~/lib/site";

// renderiza na requisição: o build não depende do painel estar no ar; os dados seguem em cache (revalidate do fetch)
export const dynamic = "force-dynamic";

// ponytail: só as primeiras páginas da busca entram; com estoque grande, paginar por loja
const MAX_PAGES = 40;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const dealers = await listDealers();

  const vehicles: MetadataRoute.Sitemap = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await searchVehicles({ pagina: String(page) });
    for (const v of result.vehicles) {
      vehicles.push({ url: `${base}/veiculo/${v.dealer.slug}/${v.slug}`, changeFrequency: "daily" });
    }
    if (page * result.pageSize >= result.total) break;
  }

  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/comprar`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/lojas`, changeFrequency: "daily" },
    ...dealers.map((d) => ({ url: `${base}/loja/${d.slug}`, changeFrequency: "daily" as const })),
    ...vehicles,
  ];
}
