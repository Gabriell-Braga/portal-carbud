import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeReturn } from "~/lib/account";
import { GOOGLE_CLIENT_ID, STATE_COOKIE, googleRedirectUri } from "~/lib/google";

export const dynamic = "force-dynamic";

/** Manda para a tela de contas do Google; o `state` no cookie impede que outro site complete o login por nós. */
export async function GET(request: Request) {
  const returnTo = safeReturn(new URL(request.url).searchParams.get("volta"));
  if (!GOOGLE_CLIENT_ID) return NextResponse.redirect(new URL(`/entrar?volta=${encodeURIComponent(returnTo)}`, request.url));

  const state = crypto.randomUUID();
  (await cookies()).set(STATE_COOKIE, JSON.stringify({ state, returnTo }), {
    path: "/api/auth/google",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
  });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
