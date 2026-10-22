"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import type { Buyer } from "~/lib/account";
import { clearFavorites } from "./favorites";

const input =
  "h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none placeholder:text-muted focus:border-ink disabled:bg-subtle disabled:text-muted";

type State = { status: "idle" | "saving" | "saved" } | { status: "error"; message: string };

/** Dados pessoais e preferências: um formulário só, salvo de uma vez. */
export function ProfileForm({ buyer }: { buyer: Buyer }) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setState({ status: "saving" });
    const response = await fetch("/api/conta/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: data.get("name"), phone: data.get("phone"), marketingOptIn: data.get("marketing") === "on" }),
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
    <form onSubmit={save} onInput={() => state.status === "saved" && setState({ status: "idle" })} className="space-y-4">
      <section id="dados" className="scroll-mt-24 rounded-2xl border border-line p-5">
        <h2 className="font-display text-lg font-bold">Dados pessoais</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="perfil-nome" className="mb-1.5 block text-sm font-semibold">Nome completo</label>
            <input id="perfil-nome" name="name" autoComplete="name" required minLength={2} defaultValue={buyer.name ?? ""} className={input} />
          </div>
          <div>
            <label htmlFor="perfil-tel" className="mb-1.5 block text-sm font-semibold">Celular (opcional)</label>
            <input id="perfil-tel" name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={buyer.phone ?? ""} placeholder="(31) 99999-9999" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="perfil-email" className="mb-1.5 block text-sm font-semibold">E-mail</label>
            <input id="perfil-email" value={buyer.email} disabled className={input} />
          </div>
        </div>
      </section>

      <section id="preferencias" className="scroll-mt-24 rounded-2xl border border-line p-5">
        <h2 className="font-display text-lg font-bold">Preferências</h2>
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input name="marketing" type="checkbox" defaultChecked={buyer.marketingOptIn} className="mt-0.5 size-5 shrink-0 accent-brand" />
          <span>
            Quero receber novidades e ofertas do Carbud
            <span className="block text-xs text-muted">Você pode desmarcar quando quiser.</span>
          </span>
        </label>
      </section>

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
      <span className="text-left">
        Sair da conta
        <span className="block text-xs font-normal text-muted">Encerrar sessão neste dispositivo</span>
      </span>
    </button>
  );
}
