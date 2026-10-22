"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import type { Buyer } from "~/lib/account";
import { clearFavorites } from "./favorites";
import { MaskedInput } from "./fields";

const input =
  "h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none placeholder:text-muted focus:border-ink disabled:bg-subtle disabled:text-muted";

type State = { status: "idle" | "saving" | "saved" } | { status: "error"; message: string };

/** Uma aba da conta por vez: dados pessoais ou preferências. O PATCH aceita só o que mudou. */
export function ProfileForm({ buyer, part }: { buyer: Buyer; part: "dados" | "preferencias" }) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setState({ status: "saving" });
    const body = part === "dados" ? { name: data.get("name"), phone: data.get("phone") } : { marketingOptIn: data.get("marketing") === "on" };
    const response = await fetch("/api/conta/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    const payload = (await response?.json().catch(() => null)) as
      | { ok: true }
      | { ok: false; error: string; details?: { message: string }[] }
      | null;
    if (payload?.ok) return setState({ status: "saved" });
    const detail = payload && !payload.ok && Array.isArray(payload.details) ? payload.details[0]?.message : undefined;
    setState({ status: "error", message: detail ?? (payload && !payload.ok ? payload.error : "Sem conexão. Tente de novo.") });
  }

  return (
    <form onSubmit={save} onInput={() => state.status === "saved" && setState({ status: "idle" })} className="mt-6 space-y-6">
      {part === "dados" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="perfil-nome" className="mb-1.5 block text-sm font-semibold">Nome completo</label>
            <input id="perfil-nome" name="name" autoComplete="name" required minLength={2} defaultValue={buyer.name ?? ""} className={input} />
          </div>
          <div>
            <label htmlFor="perfil-tel" className="mb-1.5 block text-sm font-semibold">Celular (opcional)</label>
            <MaskedInput mask="phone" id="perfil-tel" name="phone" type="tel" autoComplete="tel" defaultValue={buyer.phone ?? ""} placeholder="(31) 99999-9999" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="perfil-email" className="mb-1.5 block text-sm font-semibold">E-mail</label>
            <input id="perfil-email" value={buyer.email} disabled className={input} />
            <p className="mt-1 text-xs text-muted">O e-mail é o seu acesso e não pode ser trocado por aqui.</p>
          </div>
        </div>
      ) : (
        <label className="flex items-start gap-3 rounded-xl border border-line p-4 text-sm">
          <input name="marketing" type="checkbox" defaultChecked={buyer.marketingOptIn} className="checkbox mt-0.5" />
          <span>
            <span className="font-semibold">Novidades e ofertas do Carbud por e-mail</span>
            <span className="block text-xs text-muted">Você pode desmarcar quando quiser.</span>
          </span>
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={state.status === "saving"} className="min-h-12 rounded-lg bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
          {state.status === "saving" ? "Salvando…" : "Salvar alterações"}
        </button>
        <p role="status" className={`text-sm ${state.status === "error" ? "text-error" : "text-success"}`}>
          {state.status === "saved" ? "Dados salvos." : state.status === "error" ? state.message : ""}
        </p>
      </div>
    </form>
  );
}

export function LogoutButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/conta/auth/logout", { method: "POST" }).catch(() => null);
        clearFavorites();
        window.location.assign("/");
      }}
      className={`flex items-center gap-3 text-sm font-semibold hover:text-brand ${className}`}
    >
      <LogOut className="size-5" aria-hidden="true" />
      Sair
    </button>
  );
}
