import { redirect } from "next/navigation";
import { LoginModal } from "~/components/login-modal";
import { hasSession, safeReturn } from "~/lib/account";

type Props = { searchParams: Promise<{ volta?: string }> };

/** Entrar por cima da página atual quando a navegação vem de dentro do portal. */
export default async function LoginModalPage({ searchParams }: Props) {
  const returnTo = safeReturn((await searchParams).volta);
  if (await hasSession()) redirect(returnTo);
  return <LoginModal returnTo={returnTo} />;
}
