import { ChevronRight, Heart, Settings, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton, ProfileForm } from "~/components/account-forms";
import { currentBuyer, panelAccount } from "~/lib/account";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

const LINKS = [
  { href: "/favoritos", icon: Heart, title: "Favoritos", text: "Seus veículos salvos" },
  { href: "#dados", icon: User, title: "Dados pessoais", text: "Nome, telefone e e-mail" },
  { href: "#preferencias", icon: Settings, title: "Preferências", text: "Novidades e privacidade" },
];

/** Figma 06/07 "Minha conta • autenticado", sem Mensagens: o portal ainda não tem chat. */
export default async function AccountPage() {
  const buyer = await currentBuyer();
  if (!buyer) redirect("/entrar?volta=/conta");

  const favorites = await panelAccount("me/favorites")
    .then((response) => response.json() as Promise<{ ok: boolean; data?: unknown[] }>)
    .then((payload) => payload.data?.length ?? 0)
    .catch(() => 0);
  const firstName = buyer.name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-[1240px] px-4 lg:px-6">
      <div className="mt-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="rounded-2xl border border-line p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-soft font-display text-xl font-bold text-brand" aria-hidden="true">
              {(buyer.name ?? buyer.email).charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold">{firstName ? `Olá, ${firstName}!` : "Olá!"}</p>
              <p className="truncate text-xs text-muted">{buyer.email}</p>
            </div>
          </div>
          <nav aria-label="Sua conta" className="mt-5 divide-y divide-line border-t border-line">
            {LINKS.map(({ href, icon: Icon, title, text }) => (
              <Link key={href} href={href} className="group flex items-center gap-3 py-3 hover:text-brand">
                <Icon className="size-5 text-brand" aria-hidden="true" />
                <span className="flex-1 text-sm font-semibold">
                  {title}
                  <span className="block text-xs font-normal text-muted">{text}</span>
                </span>
                <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ))}
            <LogoutButton className="w-full py-3" />
          </nav>
        </aside>

        <div className="mt-6 space-y-4 lg:mt-0">
          <div>
            <h1 className="font-display text-2xl font-bold lg:text-3xl">Sua conta no Carbud</h1>
            <p className="mt-1 text-sm text-muted">Tudo o que você salvou, em qualquer dispositivo.</p>
          </div>
          <Link href="/favoritos" className="group flex items-center gap-4 rounded-2xl bg-subtle p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <Heart className="size-6 text-brand" aria-hidden="true" />
            <span className="flex-1">
              <span className="block font-display font-semibold">Meus favoritos</span>
              <span className="text-sm text-muted">
                {favorites} {favorites === 1 ? "veículo salvo" : "veículos salvos"}
              </span>
            </span>
            <span className="text-sm font-semibold text-brand">Ver todos →</span>
          </Link>
          <ProfileForm buyer={buyer} />
        </div>
      </div>
    </div>
  );
}
