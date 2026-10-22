import Link from "next/link";
import { km, place, price } from "~/lib/format";
import type { PortalVehicle } from "~/lib/types";
import { CardPhotos } from "./card-photos";
import { FavoriteButton } from "./favorites";

export function vehicleHref(vehicle: PortalVehicle): string {
  return `/veiculo/${vehicle.dealer.slug}/${vehicle.slug}`;
}

/**
 * Card do Figma ("Regra visual obrigatória dos cards"): a mídia vive na
 * própria caixa, recuada da borda do card e com cantos próprios; o texto
 * empilha abaixo — título, versão, dados, local, preço, CTA — com respiro
 * entre os grupos. Por cima da foto só os selos, o coração e as setas.
 */
export function VehicleCard({ vehicle, priority = false }: { vehicle: PortalVehicle; priority?: boolean }) {
  const href = vehicleHref(vehicle);
  const label = price(vehicle.priceCents, vehicle.priceOnRequest);
  const where = place(vehicle.dealer.city, vehicle.dealer.state);

  return (
    <article className="group relative flex min-w-0 flex-col rounded-2xl border border-line bg-white p-3 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-subtle">
        <CardPhotos
          photos={vehicle.photos}
          cover={vehicle.coverUrl}
          title={vehicle.title}
          seed={vehicle.id}
          href={href}
          priority={priority}
        />
        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 z-10 flex items-start justify-between gap-2">
          <span className="flex flex-wrap gap-1.5">
            {vehicle.featured && (
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white shadow-sm">Destaque</span>
            )}
            {vehicle.belowFipe && (
              <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-white shadow-sm">Abaixo da FIPE</span>
            )}
            {vehicle.status === "reserved" && (
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white shadow-sm">Reservado</span>
            )}
          </span>
          <FavoriteButton
            small
            className="pointer-events-auto relative z-10"
            item={{
              id: vehicle.id,
              href,
              title: vehicle.title,
              subtitle: `${vehicle.yearLabel} • ${km(vehicle.mileageKm)}`,
              price: label,
              cover: vehicle.coverUrl,
              photos: vehicle.photos.map((photo) => photo.card || photo.full),
            }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <h3 className="font-display text-base font-bold uppercase leading-tight">
          {/* o link cobre o card inteiro; o coração e as setas ficam acima dele (z-10) */}
          <Link href={href} className="transition-colors after:absolute after:inset-0 after:rounded-2xl group-hover:text-brand">
            {vehicle.brand} {vehicle.model}
          </Link>
        </h3>
        {vehicle.version && <p className="mt-1.5 line-clamp-1 text-xs uppercase tracking-wide text-muted">{vehicle.version}</p>}
        <p className="mt-3 text-sm text-ink">
          {vehicle.yearModel} • {km(vehicle.mileageKm)}
        </p>
        {where && <p className="mt-1.5 text-xs text-muted">{where}</p>}

        <div className="mt-auto pt-4">
          <div className="border-t border-line pt-3">
            <p className="text-xs text-muted">Preço anunciado</p>
            <p className="mt-0.5 font-display text-2xl font-bold leading-tight">{label}</p>
          </div>

          {/* Figma: o destaque já vem com o CTA cheio; os outros enchem no hover */}
          <span
            className={`mt-4 flex min-h-12 items-center justify-center rounded-xl border text-sm font-semibold transition duration-300 ${
              vehicle.featured ? "border-brand bg-brand text-white group-hover:bg-brand-hover" : "border-line group-hover:border-brand group-hover:bg-brand group-hover:text-white"
            }`}
          >
            Ver oferta
          </span>
        </div>
      </div>
    </article>
  );
}
