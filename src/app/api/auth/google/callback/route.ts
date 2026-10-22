import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { panelAccount, safeReturn, saveSession } from "~/lib/account";
import { GOOGLE_CLIENT_ID, STATE_COOKIE, googleRedirectUri } from "~/lib/google";

export const dynamic = "force-dynamic";

/**
 * Volta do Google: confere o `state`, troca o código pelo id_token e pede a
 * sessão ao painel. Termina em /entrar?sincronizar=1, que junta os favoritos
 * do aparelho com os da conta antes de devolver a pessoa para onde estava.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();
  const saved = (() => {
    try {
      return JSON.parse(jar.get(STATE_COOKIE)?.value ?? "") as { state: string; returnTo: string };
    } catch {
      return null;
    }
  })();
  jar.delete({ name: STATE_COOKIE, path: "/api/auth/google" });

  const returnTo = safeReturn(saved?.returnTo);
  const back = (query: string) => NextResponse.redirect(new URL(`/entrar?volta=${encodeURIComponent(returnTo)}${query && `&${query}`}`, url));

  const code = url.searchParams.get("code");
  // sem code = a pessoa cancelou na tela do Google; volta para o login sem alarde
  if (!code) return back("");
  if (!saved || saved.state !== url.searchParams.get("state")) return back("erro=google");

  const exchange = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  }).catch(() => null);
  const tokens = (await exchange?.json().catch(() => null)) as { id_token?: string } | null;
  if (!tokens?.id_token) return back("erro=google");

  const response = await panelAccount("auth/google", { method: "POST", body: JSON.stringify({ idToken: tokens.id_token }) }, null).catch(() => null);
  const payload = (await response?.json().catch(() => null)) as { ok: boolean; data: { token: string; expiresAt: string } } | null;
  if (!payload?.ok) return back("erro=google");

  saveSession(jar, payload.data.token, payload.data.expiresAt);
  return back("sincronizar=1");
}
