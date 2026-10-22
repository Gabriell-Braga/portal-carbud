import { cookies } from "next/headers";
import { panelHeaders, panelUrl } from "./panel";

/**
 * Conta do comprador. O painel guarda conta e sessão; o portal só segura o
 * token num cookie httpOnly do próprio domínio e repassa como Bearer.
 *
 * `carbud_conta` é um segundo cookie, legível no navegador e sem segredo
 * nenhum: só diz "tem sessão" para os favoritos saberem que podem sincronizar.
 */
export const SESSION_COOKIE = "carbud_sessao";
export const FLAG_COOKIE = "carbud_conta";

export type Buyer = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  marketingOptIn: boolean;
};

export async function sessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function hasSession(): Promise<boolean> {
  return !!(await sessionToken());
}

/** Grava a sessão que o painel devolveu: token no httpOnly, aviso legível ao lado. */
export function saveSession(jar: Awaited<ReturnType<typeof cookies>>, token: string, expiresAt: string) {
  const options = { path: "/", sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", expires: new Date(expiresAt) };
  jar.set(SESSION_COOKIE, token, { ...options, httpOnly: true });
  jar.set(FLAG_COOKIE, "1", options);
}

/** Chamada ao painel em nome do comprador. Sempre sem cache: é dado de uma pessoa. */
export async function panelAccount(path: string, init: RequestInit = {}, token?: string | null): Promise<Response> {
  const bearer = token === undefined ? await sessionToken() : token;
  return fetch(`${panelUrl()}/api/public/portal/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...panelHeaders(),
      ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
      ...init.headers,
    },
  });
}

/** Comprador logado, ou null (sem cookie ou sessão vencida). */
export async function currentBuyer(): Promise<Buyer | null> {
  if (!(await hasSession())) return null;
  const response = await panelAccount("me").catch(() => null);
  if (!response?.ok) return null;
  const payload = (await response.json()) as { ok: boolean; data: Buyer };
  return payload.ok ? payload.data : null;
}

/** Só caminho interno: `volta` vem da URL e não pode virar redirecionamento para fora. */
export function safeReturn(value: string | string[] | undefined | null, fallback = "/conta"): string {
  const path = Array.isArray(value) ? value[0] : value;
  return path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : fallback;
}
