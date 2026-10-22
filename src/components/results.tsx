import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { PortalVehicle } from "~/lib/types";
import { VehicleCard } from "./vehicle-card";

/** Link da mesma busca com um parâmetro trocado (ou removido, com `null`). */
export function withParam(base: string, params: URLSearchParams, key: string, value: string | null): string {
  const next = new URLSearchParams(params);
  if (value === null) next.delete(key);
  else next.set(key, value);
  if (key !== "pagina") next.delete("pagina");
  const qs = next.toString();
  return qs ? `${base}?${qs}` : base;
}

export function VehicleGrid({ vehicles }: { vehicles: PortalVehicle[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle, index) => (
        <li key={vehicle.id} className="min-w-0">
          <VehicleCard vehicle={vehicle} priority={index < 3} />
        </li>
      ))}
    </ul>
  );
}

export function EmptyResults({ clearHref }: { clearHref: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line px-6 py-12 text-center">
      <div className="size-20 rounded-full bg-brand-soft" aria-hidden="true" />
      <h2 className="mt-5 font-display text-lg font-bold">Nenhum carro encontrado</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">Tente ampliar a localização ou remover filtros da sua busca.</p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <Link href={clearHref} className="flex min-h-11 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-hover">
          Limpar filtros
        </Link>
        <Link href="/" className="flex min-h-11 items-center justify-center rounded-lg border border-line text-sm font-semibold hover:border-ink">
          Voltar para a busca
        </Link>
      </div>
    </div>
  );
}

export function Pagination({
  base,
  params,
  page,
  pageSize,
  total,
}: {
  base: string;
  params: URLSearchParams;
  page: number;
  pageSize: number;
  total: number;
}) {
  const pages = Math.ceil(total / pageSize);
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const range = (
    <p className="text-xs text-muted">
      Exibindo {first}–{last} de {total.toLocaleString("pt-BR")} {total === 1 ? "resultado" : "resultados"}
    </p>
  );
  if (pages <= 1) return <div className="mt-8">{range}</div>;

  // janela de até 5 páginas em volta da atual
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
  const href = (n: number) => withParam(base, params, "pagina", n === 1 ? null : String(n));
  const item = "grid size-11 place-items-center rounded-full text-sm font-semibold";

  return (
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      {range}
      <nav aria-label="Paginação" className="flex items-center justify-center gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} aria-label="Página anterior" className={`${item} border border-line hover:border-brand hover:text-brand`}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Link>
        )}
        {numbers.map((n) =>
          n === page ? (
            <span key={n} aria-current="page" className={`${item} bg-brand text-white`}>{n}</span>
          ) : (
            <Link key={n} href={href(n)} className={`${item} border border-line hover:border-brand hover:text-brand`}>{n}</Link>
          ),
        )}
        {page < pages && (
          <Link href={href(page + 1)} aria-label="Próxima página" className={`${item} border border-line hover:border-brand hover:text-brand`}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </nav>
    </div>
  );
}
