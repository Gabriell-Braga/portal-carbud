import type { Metadata } from "next";
import { FavoritesList } from "~/components/favorites";

export const metadata: Metadata = { title: "Favoritos", robots: { index: false } };

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 lg:px-6">
      <h1 className="mt-6 font-display text-2xl font-bold lg:text-3xl">Favoritos</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Os carros que você salvou ficam guardados neste navegador.</p>
      <FavoritesList />
    </div>
  );
}
