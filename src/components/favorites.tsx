"use client";

import { Check, Heart, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CarArt } from "./car-art";
import { GridSkeleton } from "./skeletons";

/**
 * Favoritos vivem no navegador e, com conta, também no painel.
 *
 * O localStorage continua sendo a fonte que a tela lê (o coração responde na
 * hora, com ou sem rede); com sessão, cada mudança vai também para a conta, e
 * `syncFavorites` junta as duas listas no login e ao abrir os favoritos.
 * Guarda um retrato do card; preço e status reais aparecem ao abrir o anúncio.
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
const INVITE_KEY = "carbud:convite-conta";

/** Cookie sem segredo que o portal grava junto da sessão (ver `lib/account.ts`). */
function loggedIn(): boolean {
  return document.cookie.split("; ").includes("carbud_conta=1");
}

function remote(method: "PUT" | "DELETE", body: FavoriteItem | FavoriteItem[] | string) {
  const query = method === "DELETE" ? `?id=${encodeURIComponent(body as string)}` : "";
  return fetch(`/api/conta/me/favorites${query}`, {
    method,
    headers: { "content-type": "application/json" },
    body: method === "PUT" ? JSON.stringify(body) : undefined,
  }).catch(() => null);
}

/** Junta o que está no aparelho com o que está na conta; os dois lados terminam iguais. */
export async function syncFavorites(): Promise<void> {
  if (!loggedIn()) return;
  const local = read();
  const response = await (local.length ? remote("PUT", local) : fetch("/api/conta/me/favorites").catch(() => null));
  const payload = (await response?.json().catch(() => null)) as { ok: boolean; data: FavoriteItem[] } | null;
  if (payload?.ok) write(payload.data);
}

/** Sair num aparelho compartilhado não pode deixar a lista de quem saiu à mostra. */
export function clearFavorites() {
  write([]);
}

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
  const [invite, setInvite] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? `Remover ${item.title} dos favoritos` : `Salvar ${item.title} nos favoritos`}
        onClick={(event) => {
          event.preventDefault();
          const items = read();
          write(saved ? items.filter((it) => it.id !== item.id) : [item, ...items]);
          if (loggedIn()) void remote(saved ? "DELETE" : "PUT", saved ? item.id : item);
          else if (!saved && !seenInvite()) setInvite(true);
        }}
        className={`grid size-11 place-items-center rounded-full bg-white/95 text-ink shadow-sm ring-1 ring-line transition hover:scale-110 hover:text-brand active:scale-95 ${className}`}
      >
        <Heart className={`size-5 transition-transform ${saved ? "scale-110 fill-brand text-brand" : ""}`} aria-hidden="true" />
      </button>
      {invite && <SaveInvite item={item} onClose={() => setInvite(false)} />}
    </>
  );
}

function seenInvite(): boolean {
  try {
    return localStorage.getItem(INVITE_KEY) === "1";
  } catch {
    return true;
  }
}

/**
 * Figma 06 · 07 "Favorito • identificação contextual": no primeiro favorito
 * sem conta, oferece salvar na conta. O carro já ficou salvo no aparelho;
 * entrar só leva a lista junto. Aparece uma vez, para não virar pedágio.
 */
function SaveInvite({ item, onClose }: { item: FavoriteItem; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
    try {
      localStorage.setItem(INVITE_KEY, "1");
    } catch {
      // sem armazenamento o convite pode reaparecer; não é grave
    }
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(event) => event.stopPropagation()}
      aria-labelledby={`convite-${item.id}`}
      className="pointer-events-auto m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-left backdrop:bg-ink/50"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 id={`convite-${item.id}`} className="font-display text-xl font-bold">Gostou deste carro?</h2>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Fechar" className="-m-2 grid size-11 place-items-center">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">Salve o anúncio para encontrá-lo depois, mesmo em outro dispositivo.</p>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line p-3">
          <div className="aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-subtle">
            {item.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <CarArt seed={item.id} />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-muted">{item.subtitle}</p>
            <p className="font-display font-bold">{item.price}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-subtle p-4">
          <p className="font-semibold">Salvar na sua conta</p>
          <p className="text-sm text-muted">Entre para sincronizar seus veículos favoritos.</p>
          <Link
            href={`/entrar?volta=${encodeURIComponent(`/favoritos?salvo=${item.id}`)}`}
            className="mt-4 flex min-h-12 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Entrar e salvar
          </Link>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="mt-2 flex min-h-12 w-full items-center justify-center rounded-lg border border-line bg-white text-sm font-semibold hover:border-ink"
          >
            Salvar apenas neste dispositivo
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Depois do login, o veículo será adicionado automaticamente aos seus favoritos.
        </p>
      </div>
    </dialog>
  );
}

export function FavoritesList({ logged, justSaved }: { logged: boolean; justSaved: boolean }) {
  const items = useFavorites();

  useEffect(() => {
    if (logged) void syncFavorites();
  }, [logged]);

  if (items === null) {
    return (
      <div className="animate-pulse" aria-busy="true" aria-label="Carregando favoritos">
        <GridSkeleton count={3} />
      </div>
    );
  }

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
    <>
      {logged && justSaved && (
        <div role="status" className="mb-5 flex items-start gap-2 rounded-xl bg-success/10 p-4 text-sm text-success">
          <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            <strong className="block">Veículo salvo!</strong>
            Você poderá acessá-lo em qualquer dispositivo.
          </p>
        </div>
      )}
      {!logged && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl bg-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Salvar na sua conta</p>
            <p className="text-sm text-muted">Estes favoritos estão só neste navegador. Entre para sincronizar com outros dispositivos.</p>
          </div>
          <Link href="/entrar?volta=/favoritos" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover">
            Entrar e salvar
          </Link>
        </div>
      )}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="group overflow-hidden rounded-2xl border border-line bg-white transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
            <Link href={item.href} className="block">
              <div className="aspect-video overflow-hidden bg-subtle">
                {item.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.cover} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <CarArt seed={item.id} className="transition-transform duration-500 group-hover:scale-105" />
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
    </>
  );
}
