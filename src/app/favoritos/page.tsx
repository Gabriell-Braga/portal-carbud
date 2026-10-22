import type { Metadata } from "next";
import { FavoritesList } from "~/components/favorites";
import { hasSession } from "~/lib/account";

export const metadata: Metadata = { title: "Favoritos", robots: { index: false } };

type Props = { searchParams: Promise<{ salvo?: string }> };

export default async function FavoritesPage({ searchParams }: Props) {
  const logged = await hasSession();
  const { salvo } = await searchParams;

  return (
    // fundo cinza até o rodapé: o -mb anula o mt do footer
    <div className="-mb-16 bg-subtle pb-16">
      <div className="mx-auto max-w-[1240px] px-4 pt-6 lg:px-6 lg:pt-10">
        <h1 className="font-display text-2xl font-bold lg:text-3xl">{logged ? "Meus favoritos" : "Favoritos"}</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          {logged ? "Seus veículos ficam salvos na conta para consultar quando quiser." : "Os carros que você salvou ficam guardados neste navegador."}
        </p>
        <FavoritesList logged={logged} justSaved={!!salvo} />
      </div>
    </div>
  );
}
