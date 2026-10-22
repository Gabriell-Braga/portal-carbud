import { cookies } from "next/headers";
import { FLAG_COOKIE, SESSION_COOKIE, panelAccount, saveSession } from "~/lib/account";

export const dynamic = "force-dynamic";

/** Só o que o navegador pode pedir; o resto do painel não passa por aqui. */
const ALLOWED: Record<string, string[]> = {
  "auth/challenge": ["POST"],
  "auth/verify": ["POST"],
  "auth/logout": ["POST"],
  me: ["GET", "PATCH"],
  "me/favorites": ["GET", "PUT", "DELETE"],
};

type Props = { params: Promise<{ path: string[] }> };

/**
 * Ponte do navegador para a conta no painel. O token nunca chega ao
 * JavaScript da página: entra no cookie httpOnly no `verify` e sai no `logout`.
 */
async function handle(request: Request, { params }: Props) {
  const path = (await params).path.join("/");
  if (!ALLOWED[path]?.includes(request.method)) {
    return Response.json({ ok: false, error: "Não encontrado" }, { status: 404 });
  }

  const visitorIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const search = new URL(request.url).search;
  const response = await panelAccount(`${path}${search}`, {
    method: request.method,
    body: request.method === "GET" ? undefined : await request.text(),
    // sem isto o limite de códigos por IP cairia sobre todo o tráfego da Vercel
    headers: visitorIp ? { "x-visitor-ip": visitorIp } : {},
  }).catch(() => null);

  if (!response) return Response.json({ ok: false, error: "Não foi possível conectar agora. Tente novamente." }, { status: 502 });
  const payload = await response.json().catch(() => ({ ok: false, error: "Resposta inválida" }));
  const jar = await cookies();

  if (path === "auth/verify" && payload.ok) {
    const { token, expiresAt, ...rest } = payload.data as { token: string; expiresAt: string };
    saveSession(jar, token, expiresAt);
    return Response.json({ ok: true, data: rest });
  }

  // sessão vencida ou encerrada: limpa os dois cookies para a página parar de achar que tem conta
  if (path === "auth/logout" || response.status === 401) {
    jar.delete(SESSION_COOKIE);
    jar.delete(FLAG_COOKIE);
  }

  return Response.json(payload, { status: response.status });
}

export { handle as GET, handle as PATCH, handle as POST, handle as PUT, handle as DELETE };
