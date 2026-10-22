"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CarArt } from "./car-art";

/**
 * Favoritos ficam no navegador: o portal não tem conta de comprador.
 * Guarda um retrato do card para a página de favoritos não precisar ir ao
 * painel; preço e status reais aparecem ao abrir o anúncio.
 */
export type FavoriteItem = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  price: string;
  cover: string | null;
};

const KEY = "carbud:favoritos";
const EVENT = "carbud:favoritos";

function read(): FavoriteItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as FavoriteItem[];
  } catch {
    return [];
  }
}

function write(items: FavoriteItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // modo privado ou armazenamento cheio: o favorito só não persiste
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// snapshot em string: useSyncExternalStore compara por referência
const snapshot = () => {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
};

/** null no servidor e na hidratação, para não desenhar favoritos que o HTML não tinha. */
function useFavorites(): FavoriteItem[] | null {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as FavoriteItem[];
  } catch {
    return [];
  }
}

export function FavoriteButton({ item, className = "" }: { item: FavoriteItem; className?: string }) {
  const saved = (useFavorites() ?? []).some((it) => it.id === item.id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remover ${item.title} dos favoritos` : `Salvar ${item.title} nos favoritos`}
      onClick={(event) => {
        event.preventDefault();
        const items = read();
        write(saved ? items.filter((it) => it.id !== item.id) : [item, ...items]);
      }}
      className={`grid size-11 place-items-center rounded-full bg-white/95 text-ink shadow-sm ring-1 ring-line transition hover:text-brand ${className}`}
    >
      <Heart className={`size-5 ${saved ? "fill-brand text-brand" : ""}`} aria-hidden="true" />
    </button>
  );
}

export function FavoritesList() {
  const items = useFavorites();

  if (items === null) return <p className="text-muted">Carregando…</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-subtle p-8 text-center">
        <p className="font-display text-lg font-semibold">Nenhum carro salvo ainda</p>
        <p className="mt-1 text-sm text-muted">Toque no coração de um anúncio para guardar aqui.</p>
        <Link
          href="/comprar"
          className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Buscar veículos
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id} className="overflow-hidden rounded-2xl border border-line bg-white">
          <Link href={item.href} className="block">
            <div className="aspect-video overflow-hidden bg-subtle">
              {item.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.cover} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <CarArt seed={item.id} />
              )}
            </div>
            <div className="p-4">
              <p className="font-display font-semibold">{item.title}</p>
              <p className="text-sm text-muted">{item.subtitle}</p>
              <p className="mt-2 font-display text-xl font-bold">{item.price}</p>
            </div>
          </Link>
          <div className="flex justify-end px-4 pb-4">
            <FavoriteButton item={item} />
          </div>
        </li>
      ))}
    </ul>
  );
}
