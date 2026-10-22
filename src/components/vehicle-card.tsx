import Link from "next/link";
import { km, place, price } from "~/lib/format";
import type { PortalVehicle } from "~/lib/types";
import { CarArt } from "./car-art";
import { FavoriteButton } from "./favorites";

export function vehicleHref(vehicle: PortalVehicle): string {
  return `/veiculo/${vehicle.dealer.slug}/${vehicle.slug}`;
}

/**
 * Card do Figma ("Regra visual obrigatória dos cards"): a mídia vive na
 * própria caixa 16:9 com overflow escondido, e o texto empilha abaixo —
 * título, dados, preço, local, CTA — sem nada por cima da foto além dos selos.
 */
export function VehicleCard({ vehicle, priority = false }: { vehicle: PortalVehicle; priority?: boolean }) {
  const href = vehicleHref(vehicle);
  const label = price(vehicle.priceCents, vehicle.priceOnRequest);
  const where = place(vehicle.dealer.city, vehicle.dealer.state);

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-subtle">
        {vehicle.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicle.coverUrl}
            alt={vehicle.title}
            className="h-full w-full object-cover"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <CarArt seed={vehicle.id} />
        )}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span>
            {vehicle.featured && (
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Destaque</span>
            )}
            {vehicle.status === "reserved" && (
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">Reservado</span>
            )}
          </span>
          <FavoriteButton
            className="relative z-10"
            item={{
              id: vehicle.id,
              href,
              title: vehicle.title,
              subtitle: `${vehicle.yearLabel} • ${km(vehicle.mileageKm)}`,
              price: label,
              cover: vehicle.coverUrl,
            }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-4 pt-4 pb-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide">
          {/* o link cobre o card inteiro; o coração fica acima dele (z-10) */}
          <Link href={href} className="after:absolute after:inset-0">
            {vehicle.brand} {vehicle.model}
          </Link>
        </h3>
        {vehicle.version && <p className="line-clamp-2 text-xs uppercase text-muted">{vehicle.version}</p>}
        <p className="text-sm text-ink">
          {vehicle.yearModel} • {km(vehicle.mileageKm)}
          {vehicle.transmissionLabel ? ` • ${vehicle.transmissionLabel}` : ""}
        </p>
        {where && <p className="text-xs text-muted">{where}</p>}

        <div className="mt-3 border-t border-line pt-3">
          <p className="text-xs text-muted">Preço anunciado</p>
          <p className="font-display text-xl font-bold">{label}</p>
          <p className="mt-0.5 truncate text-xs text-muted">{vehicle.dealer.name}</p>
        </div>

        <span className="mt-3 flex min-h-11 items-center justify-center rounded-lg border border-line text-sm font-semibold transition group-hover:border-brand group-hover:bg-brand group-hover:text-white">
          Ver oferta
        </span>
      </div>
    </article>
  );
}
