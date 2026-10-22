"use client";

import { Check, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { MaskedInput } from "./fields";

type Channel = "form" | "whatsapp";

type Props = {
  dealer: string;
  dealerName: string;
  vehicle: { id: string; title: string; model: string; price: string; summary: string };
  hasWhatsapp: boolean;
  /** "card" = coluna da ficha no desktop; "bar" = barra fixa do mobile. */
  variant: "card" | "bar";
};

type State =
  | { step: "form"; error?: string; fields?: Record<string, string> }
  | { step: "sending" }
  | { step: "done"; whatsappUrl: string | null };

const input =
  "h-12 w-full rounded-lg border bg-white px-4 text-sm outline-none placeholder:text-muted focus:border-ink aria-[invalid=true]:border-error";

/**
 * Mensagem e WhatsApp com pré-captura (Figma 02 · Mobile · Contato e estados).
 *
 * Os dois botões abrem o mesmo formulário; o WhatsApp só aparece DEPOIS que o
 * lead foi salvo, e abre por clique da pessoa — se o navegador bloquear a
 * janela, o botão continua ali. Em erro, o que foi digitado fica no formulário.
 */
export function ContactActions({ dealer, dealerName, vehicle, hasWhatsapp, variant }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [channel, setChannel] = useState<Channel>("form");
  const [state, setState] = useState<State>({ step: "form" });

  function open(next: Channel) {
    setChannel(next);
    if (state.step === "done") setState({ step: "form" });
    dialog.current?.showModal();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setState({ step: "sending" });

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        dealer,
        vehicleId: vehicle.id,
        vehicleTitle: vehicle.title,
        channel,
        name: data.get("name"),
        phone: data.get("phone"),
        email: data.get("email"),
        message: data.get("message"),
        consent: data.get("consent") === "on",
        website: data.get("website"),
        page: window.location.href,
      }),
    }).catch(() => null);

    const payload = (await response?.json().catch(() => null)) as
      | { ok: true; whatsappUrl: string | null }
      | { ok: false; error: string; fields?: Record<string, string> }
      | null;

    if (!payload) return setState({ step: "form", error: "Sem conexão. Confira a internet e tente de novo." });
    if (!payload.ok) return setState({ step: "form", error: payload.error, fields: payload.fields });
    setState({ step: "done", whatsappUrl: payload.whatsappUrl });
  }

  const fields = state.step === "form" ? state.fields ?? {} : {};
  const whatsapp = channel === "whatsapp";

  const buttons =
    variant === "card" ? (
      <div className="flex flex-col gap-2">
        <button type="button" onClick={() => open("form")} className="min-h-12 rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-hover">
          Enviar mensagem
        </button>
        {hasWhatsapp && (
          <button type="button" onClick={() => open("whatsapp")} className="min-h-12 rounded-lg bg-whatsapp text-sm font-semibold text-white hover:brightness-95">
            WhatsApp
          </button>
        )}
      </div>
    ) : (
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-flow-col gap-2 border-t border-line bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
        <button type="button" onClick={() => open("form")} className="min-h-12 rounded-lg bg-brand text-sm font-semibold text-white">
          Mensagem
        </button>
        {hasWhatsapp && (
          <button type="button" onClick={() => open("whatsapp")} className="min-h-12 rounded-lg bg-whatsapp text-sm font-semibold text-white">
            WhatsApp
          </button>
        )}
      </div>
    );

  return (
    <>
      {buttons}
      <dialog
        ref={dialog}
        aria-labelledby={`contato-${variant}`}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-white p-0 backdrop:bg-ink/50 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex max-h-[inherit] min-h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-2 sm:px-6">
            <p className="text-sm text-muted">{dealerName}</p>
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Fechar" className="grid size-11 place-items-center">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {state.step === "done" ? (
            <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
              <div className="mx-auto grid size-20 place-items-center rounded-full bg-success/10 text-success">
                <Check className="size-10" aria-hidden="true" />
              </div>
              <h2 id={`contato-${variant}`} className="mt-6 font-display text-2xl font-bold">
                {whatsapp ? "Tudo certo!" : "Mensagem enviada!"}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {whatsapp
                  ? "Seus dados foram registrados e enviados ao anunciante."
                  : "O anunciante recebeu seu contato. Você pode continuar explorando veículos."}
              </p>
              <div className="mt-5 rounded-xl bg-subtle p-4 text-sm">
                <p className="font-semibold">{vehicle.title}</p>
                <p className="text-muted">{dealerName}{whatsapp ? " • WhatsApp" : ""}</p>
                {whatsapp && <p className="mt-2 text-xs text-muted">Se o aplicativo não abrir automaticamente, use o botão abaixo.</p>}
              </div>
              <div className="mt-auto pt-8">
                {whatsapp && state.whatsappUrl ? (
                  <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center rounded-lg bg-whatsapp text-sm font-semibold text-white">
                    Abrir WhatsApp
                  </a>
                ) : (
                  <Link href="/comprar" className="flex min-h-12 items-center justify-center rounded-lg border border-line text-sm font-semibold">
                    Continuar navegando
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <form
              onSubmit={submit}
              // corrigiu o campo, some o erro dele; os outros continuam até o próximo envio
              onInput={(event) => {
                const name = (event.target as HTMLInputElement).name;
                if (state.step === "form" && state.fields?.[name]) {
                  const { [name]: _fixed, ...rest } = state.fields;
                  setState({ ...state, fields: rest });
                }
              }}
              noValidate
              className="flex flex-1 flex-col overflow-y-auto"
            >
              <div className="flex-1 px-4 py-5 sm:px-6">
                <h2 id={`contato-${variant}`} className="font-display text-2xl font-bold">
                  {whatsapp ? "Continuar no WhatsApp" : `Vamos falar sobre o ${vehicle.model}?`}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {whatsapp
                    ? "Antes de abrir o aplicativo, confirme seus dados."
                    : "Seus dados serão compartilhados com o anunciante."}
                </p>

                <div className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-subtle p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{vehicle.title}</p>
                    <p className="text-xs text-muted">{vehicle.summary}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold">{vehicle.price}</p>
                </div>

                {state.step === "form" && state.error && (
                  <p role="alert" className="mt-4 rounded-lg bg-brand-soft px-4 py-3 text-sm text-error">{state.error}</p>
                )}

                <div className="mt-4 space-y-4">
                  <Field id={`${variant}-name`} label="Nome completo" error={fields.name}>
                    <input id={`${variant}-name`} name="name" autoComplete="name" required placeholder="Nome e sobrenome" aria-invalid={!!fields.name} className={`${input} border-line`} />
                  </Field>
                  <Field id={`${variant}-phone`} label="Celular / WhatsApp" error={fields.phone}>
                    <MaskedInput mask="phone" id={`${variant}-phone`} name="phone" type="tel" autoComplete="tel" required placeholder="(31) 99999-9999" aria-invalid={!!fields.phone} className={`${input} border-line`} />
                  </Field>
                  <Field id={`${variant}-email`} label="E-mail" error={fields.email}>
                    <input id={`${variant}-email`} name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" aria-invalid={!!fields.email} className={`${input} border-line`} />
                  </Field>
                  <Field id={`${variant}-message`} label="Mensagem (opcional)" optional>
                    <textarea id={`${variant}-message`} name="message" rows={3} placeholder="Tenho interesse neste veículo." className={`${input} h-auto border-line py-3`} />
                  </Field>
                  {/* honeypot: invisível para gente, preenchido por bot */}
                  <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

                  <div>
                    <label className="flex items-start gap-3 text-sm">
                      <input name="consent" type="checkbox" aria-invalid={!!fields.consent} className="checkbox mt-0.5" />
                      <span>
                        Autorizo o compartilhamento dos meus dados com a loja para responder meu interesse.{" "}
                        <Link href="/privacidade" target="_blank" className="text-brand underline">Política de Privacidade</Link>
                      </span>
                    </label>
                    {fields.consent && <p className="mt-1 text-xs text-error">{fields.consent}</p>}
                  </div>
                </div>
              </div>

              {/* CTA fixo fora do conteúdo rolável, como pede o contrato responsivo */}
              <div className="sticky bottom-0 border-t border-line bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
                <button
                  disabled={state.step === "sending"}
                  className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 ${whatsapp ? "bg-whatsapp" : "bg-brand hover:bg-brand-hover"}`}
                >
                  {state.step === "sending" ? "Enviando…" : whatsapp ? "Continuar para WhatsApp" : (
                    <>
                      <MessageSquare className="size-4" aria-hidden="true" /> Enviar mensagem
                    </>
                  )}
                </button>
                {whatsapp && <p className="mt-2 text-center text-xs text-muted">O WhatsApp abre somente após salvar seu contato.</p>}
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}

function Field({ id, label, error, optional, children }: { id: string; label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
        {!optional && <span className="text-brand"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
