"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

/** Compartilhar anúncio: folha nativa do celular; no desktop, copia o link. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      // cancelar a folha também rejeita; não é erro para mostrar
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={share} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover">
      {copied ? <Check className="size-4" aria-hidden="true" /> : <Share2 className="size-4" aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Link copiado" : "Compartilhar anúncio"}</span>
    </button>
  );
}
