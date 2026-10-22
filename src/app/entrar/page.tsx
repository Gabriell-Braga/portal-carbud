import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginFlow } from "~/components/login-flow";
import { hasSession, safeReturn } from "~/lib/account";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

type Props = { searchParams: Promise<{ volta?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const returnTo = safeReturn((await searchParams).volta);
  if (await hasSession()) redirect(returnTo);

  return (
    <div className="mx-auto max-w-md px-4 py-8 lg:py-14">
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-8">
        <LoginFlow returnTo={returnTo} />
      </div>
    </div>
  );
}
