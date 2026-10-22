import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade", alternates: { canonical: "/privacidade" } };

// RASCUNHO: texto-base para revisão jurídica antes de publicar em produção.
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-8 text-sm leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_p]:mt-3">
      <h1 className="font-display text-3xl font-bold">Política de Privacidade</h1>
      <p className="text-muted">Versão 1</p>

      <h2>O que coletamos</h2>
      <p>
        Quando você fala com uma loja pelo Carbud, coletamos o nome, o celular, o e-mail e a mensagem que você
        escreve, junto com o anúncio de onde o contato partiu. Os veículos que você salva como favoritos ficam
        apenas no seu navegador.
      </p>

      <h2>Para que usamos</h2>
      <p>
        Seus dados são enviados à loja anunciante, que é quem responde ao seu interesse. O envio só acontece
        depois que você marca a autorização no formulário.
      </p>

      <h2>Com quem compartilhamos</h2>
      <p>Somente com a loja do anúncio. Não vendemos seus dados e não os usamos em ferramentas de medição.</p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento, conforme a Lei Geral de
        Proteção de Dados (Lei 13.709/2018), pelos canais de contato do Carbud ou diretamente com a loja.
      </p>
    </article>
  );
}
