import { siteUrl } from "./site";

/**
 * "Entrar com Google" (OAuth com redirecionamento, sem SDK). O portal troca o
 * código pelo id_token aqui no servidor e entrega o token ao painel, que
 * confere no Google antes de abrir a sessão (`portal/auth/google`).
 *
 * O Client ID não é segredo e o botão precisa dele no navegador; o secret só
 * existe no servidor.
 */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
export const STATE_COOKIE = "carbud_google";

/** Tem que bater, caractere por caractere, com o "Authorized redirect URI" do client no Google Cloud. */
export function googleRedirectUri(): string {
  return `${siteUrl()}/api/auth/google/callback`;
}
