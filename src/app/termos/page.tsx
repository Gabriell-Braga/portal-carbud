import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de uso", alternates: { canonical: "/termos" } };

// RASCUNHO: texto-base para revisão jurídica antes de publicar em produção.
export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-8 text-sm leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_p]:mt-3">
      <h1 className="font-display text-3xl font-bold">Termos de uso</h1>

      <h2>O que é o Carbud</h2>
      <p>
        O Carbud reúne anúncios de veículos publicados por lojas que usam a plataforma Carbud. A negociação, o
        preço final e a entrega são combinados diretamente entre você e a loja.
      </p>

      <h2>Anúncios</h2>
      <p>
        Fotos, preços e informações são de responsabilidade da loja anunciante. Confira o veículo e a
        documentação pessoalmente antes de fechar negócio.
      </p>

      <h2>Contato com lojas</h2>
      <p>Use os formulários apenas para tratar de veículos anunciados. Envios automatizados ou abusivos são bloqueados.</p>
    </article>
  );
}
