import { whatsappLink } from "~/lib/format";
import { fetchDealer, panelHeaders, panelUrl } from "~/lib/panel";

export const dynamic = "force-dynamic";

type Body = {
  dealer?: string;
  vehicleId?: string;
  vehicleTitle?: string;
  channel?: "form" | "whatsapp";
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  consent?: boolean;
  website?: string;
  page?: string;
};

function fail(status: number, error: string, fields?: Record<string, string>) {
  return Response.json({ ok: false, error, fields }, { status });
}

/**
 * Lead do portal → painel da revenda dona do carro.
 *
 * Fluxo do handoff (cards 04/05): validar, SALVAR o lead e só então devolver o
 * link do WhatsApp — o navegador nunca abre o wa.me antes do lead existir.
 * O número da loja é montado aqui, a partir do cadastro dela no painel, e não
 * vem do formulário.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return fail(400, "Dados inválidos.");

  const name = body.name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const fields: Record<string, string> = {};
  if (name.length < 2) fields.name = "Informe seu nome";
  if (phone.replace(/\D/g, "").length < 10) fields.phone = "Informe um telefone válido com DDD";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = "Informe um e-mail válido";
  if (body.consent !== true) fields.consent = "É preciso autorizar o compartilhamento";
  if (Object.keys(fields).length) return fail(400, "Confira os campos destacados.", fields);

  if (!body.dealer) return fail(400, "Anúncio não informado.");
  const dealer = await fetchDealer(body.dealer);
  if (!dealer) return fail(404, "Esta loja não está recebendo contatos agora.");

  const channel = body.channel === "whatsapp" ? "whatsapp" : "form";
  const visitorIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = request.headers.get("user-agent");

  const response = await fetch(`${panelUrl()}/api/leads`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...panelHeaders(),
      // sem isto o limite por IP do painel cairia sobre todo o tráfego da Vercel
      ...(visitorIp ? { "x-visitor-ip": visitorIp } : {}),
      ...(userAgent ? { "user-agent": userAgent } : {}),
    },
    body: JSON.stringify({
      tenantSlug: body.dealer,
      vehicleId: body.vehicleId || "",
      name,
      phone,
      email,
      message: body.message?.trim().slice(0, 2000) || undefined,
      website: body.website,
      kind: channel === "whatsapp" ? "whatsapp" : "contato",
      utm: { source: "carbud-portal", medium: "portal", page: body.page?.slice(0, 500) },
    }),
  }).catch(() => null);

  if (!response) return fail(502, "Não foi possível enviar agora. Tente novamente.");
  if (response.status === 429) return fail(429, "Muitos envios seguidos. Aguarde alguns minutos.");
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    return fail(response.status >= 500 ? 502 : response.status, payload?.error ?? "Não foi possível enviar agora.");
  }

  const whatsappUrl =
    channel === "whatsapp"
      ? whatsappLink(
          dealer.site.contact.whatsappDigits,
          `Olá! Vi no Portal Carbud${body.vehicleTitle ? ` o ${body.vehicleTitle}` : " um anúncio da loja"} e gostaria de mais informações.`,
        )
      : null;

  return Response.json({ ok: true, whatsappUrl });
}
