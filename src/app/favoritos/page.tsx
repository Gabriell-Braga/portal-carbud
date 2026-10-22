import type { Metadata } from "next";
import { FavoritesList } from "~/components/favorites";
import { hasSession } from "~/lib/account";

export const metadata: Metadata = { title: "Favoritos", robots: { index: false } };

type Props = { searchParams: Promise<{ salvo?: string }> };

export default async function FavoritesPage({ searchParams }: Props) {
  const logged = await hasSession();
  const { salvo } = await searchParams;

  return (
    <div className="mx-auto max-w-[1240px] px-4 lg:px-6">
      <h1 className="mt-6 font-display text-2xl font-bold lg:text-3xl">{logged ? "Meus favoritos" : "Favoritos"}</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        {logged ? "Salvos na sua conta e disponíveis em qualquer dispositivo." : "Os carros que você salvou ficam guardados neste navegador."}
      </p>
      <FavoritesList logged={logged} justSaved={!!salvo} />
    </div>
  );
}
