import type { NextConfig } from "next";

const panel = (process.env.PANEL_URL ?? "").trim().replace(/\/+$/, "");
if (!panel) throw new Error("PANEL_URL não está definida (ex.: https://crm.carbud.com.br/app).");
const panelUrl = /^https?:\/\//i.test(panel) ? panel : `https://${panel}`;

const nextConfig: NextConfig = {
  /*
   * Fotos servidas pelo domínio do portal.
   *
   * O R2 do painel é privado e só o painel sabe servir as imagens; o rewrite
   * deixa o <img> apontando para /media/... e a Vercel encaminha na borda.
   */
  async rewrites() {
    return [{ source: "/media/:path*", destination: `${panelUrl}/api/media/:path*` }];
  },
};

export default nextConfig;
