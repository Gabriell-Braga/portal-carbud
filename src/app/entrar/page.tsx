import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginCard } from "~/components/login-modal";
import { hasSession, safeReturn } from "~/lib/account";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

type Props = { searchParams: Promise<{ volta?: string }> };

/** Link direto para /entrar: o mesmo cartão do modal, sobre o fundo cinza. */
export default async function LoginPage({ searchParams }: Props) {
  const returnTo = safeReturn((await searchParams).volta);
  if (await hasSession()) redirect(returnTo);

  return (
    // fundo cinza até o rodapé: o -mb anula o mt do footer
    <div className="-mb-16 bg-subtle px-4 pt-8 pb-24 lg:pt-14">
      <div className="mx-auto max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-line">
        <LoginCard returnTo={returnTo} />
      </div>
    </div>
  );
}
