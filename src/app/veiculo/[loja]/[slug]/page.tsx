import { ArrowRight, BadgeCheck, Check, FileText, MapPin, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ContactActions } from "~/components/contact";
import { FavoriteButton } from "~/components/favorites";
import { Gallery } from "~/components/gallery";
import { ShareButton } from "~/components/share";
import { VehicleGrid } from "~/components/results";
import { Viewer360 } from "~/components/viewer-360";
import { km, place, price } from "~/lib/format";
import { fetchDealer, fetchVehicle, searchVehicles } from "~/lib/panel";
import { siteUrl } from "~/lib/site";
import type { Dealer } from "~/lib/types";

// renderiza na requisição: o build não depende do painel estar no ar; os dados seguem em cache (revalidate do fetch)
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ loja: string; slug: string }> };

// metadata e página pedem os mesmos dados; `cache` faz uma ida ao painel só
const load = cache(async (loja: string, slug: string) => {
  const [detail, dealerSite] = await Promise.all([fetchVehicle(loja, slug), fetchDealer(loja)]);
  if (!detail || !dealerSite) return null;
  const dealer: Dealer = {
    slug: dealerSite.site.slug,
    name: dealerSite.site.name,
    city: dealerSite.site.contact.address.city,
    state: dealerSite.site.contact.address.state,
  };
  return { ...detail, dealer, dealerSite };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { loja, slug } = await params;
  const data = await load(loja, slug);
  if (!data) return { title: "Anúncio não encontrado" };
  const { vehicle, dealer } = data;
  const description = `${vehicle.title} ${vehicle.yearLabel}, ${km(vehicle.mileageKm)}, ${price(vehicle.priceCents, vehicle.priceOnRequest)} na ${dealer.name}${dealer.city ? ` em ${dealer.city}` : ""}.`;
  return {
    title: `${vehicle.title} ${vehicle.yearModel}`,
    description,
    alternates: { canonical: `/veiculo/${loja}/${slug}` },
    openGraph: { title: vehicle.title, description, images: vehicle.coverUrl ? [vehicle.coverUrl] : undefined },
  };
}

export default async function VehiclePage({ params }: Props) {
  const { loja, slug } = await params;
  const data = await load(loja, slug);
  if (!data) notFound();

  const { vehicle, dealer, dealerSite, related } = data;
  // o `related` da rota da loja só traz a capa; a busca do portal traz as fotos do carrossel
  const others =
    (await searchVehicles({ loja: dealer.slug }).catch(() => null))?.vehicles.filter((item) => item.id !== vehicle.id).slice(0, 3) ??
    related.slice(0, 3).map((item) => ({ ...item, dealer }));
  const label = price(vehicle.priceCents, vehicle.priceOnRequest);
  const where = place(dealer.city, dealer.state);
  const address = dealerSite.site.contact.address.full ?? where;
  const summary = [vehicle.yearModel, km(vehicle.mileageKm), vehicle.transmissionLabel, vehicle.fuelLabel, where]
    .filter(Boolean)
    .join(" • ");

  const specs = [
    ["Ano", vehicle.yearLabel],
    ["KM", km(vehicle.mileageKm).replace(" km", "")],
    ["Câmbio", vehicle.transmissionLabel],
    ["Combustível", vehicle.fuelLabel],
    ["Cor", vehicle.color],
    ["Carroceria", vehicle.bodyTypeLabel],
    ["Portas", vehicle.doors ? String(vehicle.doors) : null],
    ["Final da placa", vehicle.licensePlateEnd],
  ].filter((spec): spec is [string, string] => !!spec[1]);

  const contactProps = {
    dealer: dealer.slug,
    dealerName: dealer.name,
    vehicle: {
      id: vehicle.id,
      title: vehicle.title,
      model: vehicle.model,
      price: label,
      summary: `${vehicle.yearModel} • ${km(vehicle.mileageKm)}`,
    },
    hasWhatsapp: !!dealerSite.site.contact.whatsappDigits,
  };

  // Vehicle + Offer só com dado real (handoff 11): sem nota, sem avaliação inventada
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicle.title,
    brand: { "@type": "Brand", name: vehicle.brand },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.yearModel),
    productionDate: String(vehicle.yearManufacture),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileageKm, unitCode: "KMT" },
    ...(vehicle.color && { color: vehicle.color }),
    ...(vehicle.fuelLabel && { fuelType: vehicle.fuelLabel }),
    ...(vehicle.transmissionLabel && { vehicleTransmission: vehicle.transmissionLabel }),
    ...(vehicle.photos.length && { image: vehicle.photos.map((p) => `${siteUrl()}${p.full}`) }),
    url: `${siteUrl()}/veiculo/${dealer.slug}/${vehicle.slug}`,
    ...(!vehicle.priceOnRequest &&
      vehicle.priceCents > 0 && {
        offers: {
          "@type": "Offer",
          price: vehicle.priceCents / 100,
          priceCurrency: "BRL",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/UsedCondition",
          seller: { "@type": "AutoDealer", name: dealer.name },
        },
      }),
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 lg:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Trilha" className="mt-4 truncate text-xs text-muted">
        <Link href="/" className="hover:text-ink">Início</Link> /{" "}
        <Link href={`/comprar?marca=${encodeURIComponent(vehicle.brand)}`} className="hover:text-ink">{vehicle.brand}</Link> /{" "}
        <Link href={`/comprar?marca=${encodeURIComponent(vehicle.brand)}&modelo=${encodeURIComponent(vehicle.model)}`} className="hover:text-ink">{vehicle.model}</Link>
        {vehicle.version && <> / <span>{vehicle.version}</span></>}
      </nav>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* compartilhar na linha do título: embaixo dele empurrava as fotos para baixo */}
          <div className="flex flex-wrap items-center gap-x-4">
            <h1 className="font-display text-2xl font-bold lg:text-3xl">{vehicle.title}</h1>
            <ShareButton title={vehicle.title} />
          </div>
          <p className="text-sm text-muted">{summary}</p>
        </div>
        <FavoriteButton
          className="shrink-0"
          item={{ id: vehicle.id, href: `/veiculo/${dealer.slug}/${vehicle.slug}`, title: vehicle.title, subtitle: `${vehicle.yearLabel} • ${km(vehicle.mileageKm)}`, price: label, cover: vehicle.coverUrl, photos: vehicle.photos.map((photo) => photo.card || photo.full) }}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-line p-3 lg:p-4">
            <Gallery photos={vehicle.photos} title={vehicle.title} seed={vehicle.id} />
          </div>

          {(vehicle.spin?.length || vehicle.pano) && (
            <Viewer360 spin={vehicle.spin ?? []} pano={vehicle.pano ?? null} title={vehicle.title} />
          )}

          {/* no mobile o preço vem logo depois das fotos */}
          <PriceCard className="lg:hidden" vehicle={vehicle} label={label} dealer={dealer} />

          <section className="rounded-2xl border border-line p-5">
            <h2 className="font-display text-lg font-bold">Características do veículo</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              {specs.map(([term, value]) => (
                <div key={term}>
                  <dt className="text-xs text-muted">{term}</dt>
                  <dd className="text-sm font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {vehicle.inspection && (
            <section className="rounded-2xl border border-line p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <ShieldCheck className="size-5 text-success" aria-hidden="true" /> Veículo vistoriado
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted">Empresa</dt>
                  <dd className="text-sm font-semibold">{vehicle.inspection.provider}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Data do laudo</dt>
                  <dd className="text-sm font-semibold">{vehicle.inspection.date.split("-").reverse().join("/")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Resultado</dt>
                  <dd className="text-sm font-semibold">{vehicle.inspection.resultLabel}</dd>
                </div>
              </dl>
              <a href={vehicle.inspection.reportUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-hover">
                <FileText className="size-4" aria-hidden="true" /> Ver laudo (PDF)
              </a>
            </section>
          )}

          {(vehicle.description || vehicle.options.length > 0) && (
            <section className="rounded-2xl border border-line p-5">
              <h2 className="font-display text-lg font-bold">Sobre este veículo</h2>
              {vehicle.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{vehicle.description}</p>}
              {vehicle.options.length > 0 && (
                <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {vehicle.options.map((option) => (
                    <li key={option.key} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      {option.label}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {address && (
            <section className="rounded-2xl border border-line p-5">
              <h2 className="font-display text-lg font-bold">Localização</h2>
              {/* embed sem chave de API; carrega só quando chega perto da tela */}
              <iframe
                title={`Mapa: ${dealer.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="mt-4 aspect-[16/7] w-full rounded-xl border-0 bg-subtle"
              />
              <p className="mt-3 flex items-start gap-1 text-sm text-muted">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {address}
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <PriceCard className="hidden lg:block" vehicle={vehicle} label={label} dealer={dealer}>
            <div className="mt-5">
              <ContactActions {...contactProps} variant="card" />
            </div>
            <p className="mt-4 text-xs text-muted">✓ Seu contato é enviado ao anunciante após a confirmação dos dados.</p>
          </PriceCard>

          <section className="rounded-2xl border border-line p-5">
            <h2 className="flex items-center gap-1 font-display font-bold">
              Conheça o anunciante <BadgeCheck className="size-4 text-success" aria-label="Loja cadastrada no Carbud" />
            </h2>
            <p className="mt-3 font-semibold">{dealer.name}</p>
            {where && <p className="text-xs text-muted">{where}</p>}
            {dealerSite.site.contact.mapsUrl && (
              <a href={dealerSite.site.contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
                <MapPin className="size-3" aria-hidden="true" /> Ver no mapa
              </a>
            )}
            <Link href={`/loja/${dealer.slug}`} className="mt-4 flex items-center gap-1 border-t border-line pt-4 text-sm font-semibold text-brand">
              Ver veículos da loja <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">Outras oportunidades para você</h2>
          <div className="mt-4">
            <VehicleGrid vehicles={others} />
          </div>
        </section>
      )}

      <ContactActions {...contactProps} variant="bar" />
    </div>
  );
}

function PriceCard({
  vehicle,
  label,
  dealer,
  className = "",
  children,
}: {
  vehicle: { featured: boolean; status: string };
  label: string;
  dealer: Dealer;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-line p-5 ${className}`}>
      <div className="flex gap-2">
        {vehicle.featured && <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Destaque</span>}
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{label}</p>
      <p className="mt-1 text-xs text-muted">Preço anunciado • financiamento sujeito à análise</p>
      <div className="mt-4 border-t border-line pt-4">
        <p className="text-sm font-semibold">{dealer.name}</p>
        <p className="text-xs text-muted">Loja cadastrada{dealer.city ? ` • ${place(dealer.city, dealer.state)}` : ""}</p>
      </div>
      {children}
    </section>
  );
}
