"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { syncFavorites } from "./favorites";
import { MaskedInput } from "./fields";

type Step = "email" | "code" | "profile";
type Payload<T> = { ok: true; data: T } | { ok: false; error: string; details?: { reason?: string } | { path: string; message: string }[] };

const RESEND_SECONDS = 60;
const input =
  "h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none placeholder:text-muted focus:border-ink aria-[invalid=true]:border-error";
const primary =
  "flex min-h-12 w-full items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60";

async function call<T>(path: string, method: string, body?: unknown): Promise<Payload<T>> {
  const response = await fetch(`/api/conta/${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch(() => null);
  if (!response) return { ok: false, error: "Sem conexão. Confira a internet e tente de novo." };
  return response.json().catch(() => ({ ok: false, error: "Não foi possível concluir agora." }));
}

/**
 * Entrar ou criar conta (Figma 06/07 · Autenticação): e-mail, código de seis
 * dígitos e, só no primeiro acesso, nome e telefone. Sem senha.
 * Termina devolvendo a pessoa para onde ela estava (`volta`).
 */
export function LoginFlow({ returnTo }: { returnTo: string }) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<{ message: string; reason?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function finish() {
    await syncFavorites();
    window.location.assign(returnTo);
  }

  async function sendCode(event?: React.FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError(null);
    const result = await call<{ devCode?: string }>("auth/challenge", "POST", { email });
    setBusy(false);
    if (!result.ok) return setError({ message: result.error });
    setDevCode(result.data.devCode ?? null);
    setCode("");
    setWait(RESEND_SECONDS);
    setStep("code");
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await call<{ isNew: boolean }>("auth/verify", "POST", { email, code });
    if (!result.ok) {
      setBusy(false);
      const reason = !Array.isArray(result.details) ? result.details?.reason : undefined;
      return setError({ message: result.error, reason });
    }
    if (result.data.isNew) {
      setBusy(false);
      return setStep("profile");
    }
    await finish();
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    const result = await call("me", "PATCH", {
      name: data.get("name"),
      phone: data.get("phone"),
      marketingOptIn: data.get("marketing") === "on",
    });
    if (!result.ok) {
      setBusy(false);
      const first = Array.isArray(result.details) ? result.details[0]?.message : undefined;
      return setError({ message: first ?? result.error });
    }
    await finish();
  }

  if (step === "profile") {
    return (
      <form onSubmit={saveProfile} className="space-y-4">
        <div className="h-1 rounded-full bg-brand" aria-hidden="true" />
        <div>
          <h1 className="font-display text-2xl font-bold">Só mais um detalhe</h1>
          <p className="mt-1 text-sm text-muted">Como você gostaria de ser chamado no Carbud?</p>
        </div>
        {error && <p role="alert" className="rounded-lg bg-brand-soft px-4 py-3 text-sm text-error">{error.message}</p>}
        <div>
          <label htmlFor="conta-nome" className="mb-1.5 block text-sm font-semibold">Nome completo <span className="text-brand">*</span></label>
          <input id="conta-nome" name="name" autoComplete="name" required minLength={2} placeholder="Seu nome e sobrenome" className={input} />
        </div>
        <div>
          <label htmlFor="conta-tel" className="mb-1.5 block text-sm font-semibold">Celular (opcional)</label>
          <MaskedInput mask="phone" id="conta-tel" name="phone" type="tel" autoComplete="tel" placeholder="(31) 99999-9999" className={input} />
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input name="marketing" type="checkbox" className="checkbox mt-0.5" />
          <span>
            Quero receber novidades e ofertas do Carbud
            <span className="block text-xs text-muted">Opcional. Você pode alterar isso a qualquer momento.</span>
          </span>
        </label>
        <button disabled={busy} className={primary}>{busy ? "Salvando…" : "Concluir cadastro"}</button>
        <p className="text-xs text-muted">Seu e-mail já foi validado. Você poderá revisar seus dados no perfil.</p>
      </form>
    );
  }

  if (step === "code") {
    const failed = !!error;
    return (
      <form onSubmit={verify} className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold">{failed ? "Não conseguimos validar" : "Confira seu e-mail"}</h1>
          <p className="mt-1 text-sm text-muted">
            {failed ? "O código está incorreto ou já expirou. Confira os dígitos ou solicite outro." : "Enviamos um código de seis dígitos para"}
          </p>
          {!failed && (
            <p className="mt-1 text-sm">
              <strong>{email}</strong>{" "}
              <button type="button" onClick={() => { setStep("email"); setError(null); }} className="ml-2 font-semibold text-brand hover:text-brand-hover">
                Alterar
              </button>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="conta-codigo" className="mb-2 block text-sm font-semibold">Código de verificação</label>
          {/* um campo só por baixo das seis caixas: colar e o preenchimento automático do celular funcionam */}
          <div className="group relative">
            <input
              id="conta-codigo"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                if (error?.reason === "invalid") setError(null);
              }}
              autoComplete="one-time-code"
              inputMode="numeric"
              autoFocus
              required
              pattern="\d{6}"
              aria-invalid={failed}
              aria-describedby={failed ? "conta-codigo-erro" : undefined}
              className="absolute inset-0 z-10 w-full cursor-text opacity-0"
            />
            <div className="grid grid-cols-6 gap-2" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  key={i}
                  className={`grid h-14 place-items-center rounded-lg border text-xl font-semibold transition ${
                    failed ? "border-error text-error" : i === Math.min(code.length, 5) ? "border-line group-focus-within:border-brand group-focus-within:ring-2 group-focus-within:ring-brand/20" : "border-line"
                  }`}
                >
                  {code[i] ?? (failed ? "•" : "")}
                </span>
              ))}
            </div>
          </div>
          {failed && <p id="conta-codigo-erro" role="alert" className="mt-2 text-xs text-error">{error.message}</p>}
          {devCode && <p className="mt-2 text-xs text-muted">Ambiente de teste, sem e-mail configurado: o código é <strong>{devCode}</strong>.</p>}
        </div>

        {error?.reason === "expired" ? (
          <button type="button" onClick={() => sendCode()} disabled={busy} className={primary}>Enviar novo código</button>
        ) : (
          <button disabled={busy || code.length < 6} className={primary}>{busy ? "Verificando…" : failed ? "Tentar novamente" : "Verificar e continuar"}</button>
        )}

        <div className="flex items-center justify-between text-sm text-muted">
          <span>Não recebeu o código?</span>
          {wait > 0 ? (
            <span>Reenviar em 00:{String(wait).padStart(2, "0")}</span>
          ) : (
            <button type="button" onClick={() => sendCode()} disabled={busy} className="font-semibold text-brand hover:text-brand-hover">
              Enviar novo código
            </button>
          )}
        </div>

        <div className="flex gap-3 rounded-xl bg-subtle p-4 text-sm">
          <ShieldCheck className="size-5 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="font-semibold">Protegemos seu acesso</p>
            <p className="text-muted">O código expira em poucos minutos e só pode ser usado uma vez. Por segurança, limitamos tentativas seguidas.</p>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Entre ou crie sua conta</h1>
        <p className="mt-1 text-sm text-muted">Salve anúncios e continue de onde parou, em qualquer dispositivo.</p>
      </div>
      {error && <p role="alert" className="rounded-lg bg-brand-soft px-4 py-3 text-sm text-error">{error.message}</p>}
      <div>
        <label htmlFor="conta-email" className="mb-1.5 block text-sm font-semibold">E-mail</label>
        <input
          id="conta-email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nome@exemplo.com"
          className={input}
        />
      </div>
      <button disabled={busy} className={primary}>{busy ? "Enviando…" : "Continuar com e-mail"}</button>
      <p className="border-t border-line pt-5 text-center text-xs text-muted">
        Primeiro acesso? A conta é criada depois que você confirmar o e-mail. Ao continuar, você aceita os <Link href="/termos" className="underline hover:text-ink">Termos de Uso</Link> e reconhece a{" "}
        <Link href="/privacidade" className="underline hover:text-ink">Política de Privacidade</Link>.
      </p>
    </form>
  );
}
