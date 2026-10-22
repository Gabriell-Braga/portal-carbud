"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { LoginFlow } from "./login-flow";

/** Logo + fechar: o mesmo topo no modal e na página /entrar (Figma 05 · Login). */
export function LoginCard({ returnTo, onClose }: { returnTo: string; onClose?: () => void }) {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/carbud-logo.svg" alt="carbud" className="h-8 w-auto" />
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Fechar" className="-m-2 grid size-11 place-items-center rounded-full hover:bg-subtle">
            <X className="size-5" aria-hidden="true" />
          </button>
        ) : (
          <a href="/" aria-label="Fechar" className="-m-2 grid size-11 place-items-center rounded-full hover:bg-subtle">
            <X className="size-5" aria-hidden="true" />
          </a>
        )}
      </div>
      <LoginFlow returnTo={returnTo} />
    </div>
  );
}

/**
 * "Entrar" aberto por cima da página em que a pessoa estava (rota interceptada
 * em `@modal/(.)entrar`). Fechar volta no histórico; abrir o link direto cai
 * na página /entrar, com o mesmo cartão.
 */
export function LoginModal({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={() => router.back()}
      aria-label="Entre ou crie sua conta"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/50"
    >
      <LoginCard returnTo={returnTo} onClose={() => dialog.current?.close()} />
    </dialog>
  );
}
