import { CalendarDays, Gauge, MapPin } from "lucide-react";
import Link from "next/link";
import { km, place, price } from "~/lib/format";
import type { PortalVehicle } from "~/lib/types";
import { CardPhotos } from "./card-photos";
import { FavoriteButton } from "./favorites";

export function vehicleHref(vehicle: PortalVehicle): string {
  return `/veiculo/${vehicle.dealer.slug}/${vehicle.slug}`;
}

/**
 * Foto sangrando no topo do card (4:3), com só o coração, as setas (no hover)
 * e o contador por cima; selos, dados, preço e CTA empilham abaixo.
 */
export function VehicleCard({ vehicle, priority = false }: { vehicle: PortalVehicle; priority?: boolean }) {
  const href = vehicleHref(vehicle);
  const label = price(vehicle.priceCents, vehicle.priceOnRequest);
  const where = place(vehicle.dealer.city, vehicle.dealer.state);
  const badges = vehicle.featured || vehicle.belowFipe || vehicle.inspected || vehicle.has360 || vehicle.status === "reserved";
  const badge = "rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide";

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-subtle">
        <CardPhotos
          photos={vehicle.photos}
          cover={vehicle.coverUrl}
          title={vehicle.title}
          seed={vehicle.id}
          href={href}
          priority={priority}
        />
        <FavoriteButton
          small
          className="absolute right-2.5 top-2.5 z-10"
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

      <div className="flex flex-1 flex-col p-4">
        {badges && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {vehicle.featured && <span className={`${badge} bg-brand text-white`}>Destaque</span>}
            {vehicle.belowFipe && <span className={`${badge} bg-success text-white`}>Abaixo da FIPE</span>}
            {vehicle.inspected && <span className={`${badge} bg-subtle text-ink`}>Vistoriado</span>}
            {vehicle.has360 && <span className={`${badge} bg-subtle text-ink`}>360°</span>}
            {vehicle.status === "reserved" && <span className={`${badge} bg-ink text-white`}>Reservado</span>}
          </div>
        )}
        <h3 className="font-display text-base font-bold uppercase leading-tight">
          {/* o link cobre o card inteiro; o coração e as setas ficam acima dele (z-10) */}
          <Link href={href} className="transition-colors after:absolute after:inset-0 after:rounded-2xl group-hover:text-brand">
            {vehicle.brand} {vehicle.model}
          </Link>
        </h3>
        {vehicle.version && <p className="mt-1 line-clamp-2 text-sm text-muted">{vehicle.version}</p>}
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-muted" aria-hidden="true" />
            {vehicle.yearModel}
          </span>
          <span className="flex items-center gap-1.5">
            <Gauge className="size-4 text-muted" aria-hidden="true" />
            {km(vehicle.mileageKm)}
          </span>
        </p>
        {where && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink">
            <MapPin className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <span className="truncate">{where}</span>
          </p>
        )}

        <div className="mt-auto pt-4">
          <p className="font-display text-2xl font-bold leading-tight">{label}</p>
          <span className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-ink text-sm font-semibold text-white transition duration-300 group-hover:bg-brand">
            Ver oferta
          </span>
        </div>
      </div>
    </article>
  );
}
