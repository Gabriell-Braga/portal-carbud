import { ArrowRight, ChevronRight, Heart, House, Search, Settings, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton, ProfileForm } from "~/components/account-forms";
import { currentBuyer, panelAccount } from "~/lib/account";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

type Tab = "geral" | "dados" | "preferencias";
type Props = { searchParams: Promise<{ aba?: string }> };

const NAV = [
  { href: "/conta", tab: "geral", icon: House, label: "Visão geral" },
  { href: "/favoritos", tab: null, icon: Heart, label: "Meus favoritos" },
  { href: "/conta?aba=dados", tab: "dados", icon: User, label: "Dados pessoais" },
  { href: "/conta?aba=preferencias", tab: "preferencias", icon: Settings, label: "Preferências" },
] as const;

const SETTINGS = [
  { href: "/conta?aba=dados", label: "Editar dados pessoais" },
  { href: "/conta?aba=preferencias", label: "Preferências de comunicação" },
  { href: "/privacidade", label: "Privacidade e segurança" },
];

/** Figma 05 "Minha conta • autenticado", sem Mensagens: o portal ainda não tem chat. */
export default async function AccountPage({ searchParams }: Props) {
  const buyer = await currentBuyer();
  if (!buyer) redirect("/entrar?volta=/conta");

  const { aba } = await searchParams;
  const tab: Tab = aba === "dados" || aba === "preferencias" ? aba : "geral";

  const favorites = await panelAccount("me/favorites")
    .then((response) => response.json() as Promise<{ ok: boolean; data?: unknown[] }>)
    .then((payload) => payload.data?.length ?? 0)
    .catch(() => 0);

  return (
    // fundo cinza até o rodapé: o -mb anula o mt do footer
    <div className="-mb-16 bg-subtle pb-16">
      <div className="mx-auto max-w-[1240px] px-4 pt-6 lg:px-6 lg:pt-10">
        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <aside className="rounded-2xl border border-line bg-white p-4 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 p-2">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-soft font-display text-xl font-bold text-brand" aria-hidden="true">
                {(buyer.name ?? buyer.email).charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold">{buyer.name ?? "Sua conta"}</p>
                <p className="truncate text-xs text-muted">{buyer.email}</p>
              </div>
            </div>
            <nav aria-label="Sua conta" className="mt-4 grid gap-1">
              {NAV.map(({ href, tab: target, icon: Icon, label }) => {
                const current = target === tab;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={current ? "page" : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold ${current ? "bg-brand-soft text-brand" : "hover:bg-subtle"}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
              <LogoutButton className="min-h-12 rounded-xl px-4 hover:bg-subtle" />
            </nav>
          </aside>

          <section className="mt-4 rounded-2xl border border-line bg-white p-5 lg:mt-0 lg:p-8">
            {tab === "geral" ? (
              <>
                <h1 className="font-display text-2xl font-bold lg:text-3xl">Sua conta no Carbud</h1>
                <p className="mt-1 text-sm text-muted">Continue sua busca de onde parou.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Tile href="/favoritos" icon={Heart} title="Favoritos" cta="Ver favoritos">
                    {favorites ? `${favorites} ${favorites === 1 ? "veículo salvo" : "veículos salvos"}` : "Veículos que você salvou"}
                  </Tile>
                  <Tile href="/comprar" icon={Search} title="Buscar veículos" cta="Ver ofertas">
                    Estoque das lojas cadastradas no Carbud
                  </Tile>
                </div>

                <h2 className="mt-10 font-display text-lg font-bold">Dados e preferências</h2>
                <ul className="mt-2">
                  {SETTINGS.map((item) => (
                    <li key={item.href} className="border-b border-line">
                      <Link href={item.href} className="group flex min-h-14 items-center justify-between text-sm font-semibold hover:text-brand">
                        {item.label}
                        <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold lg:text-3xl">{tab === "dados" ? "Dados pessoais" : "Preferências"}</h1>
                <p className="mt-1 text-sm text-muted">
                  {tab === "dados" ? "Usados para as lojas responderem seu interesse." : "Escolha o que você quer receber do Carbud."}
                </p>
                <ProfileForm key={tab} buyer={buyer} part={tab} />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Tile({
  href,
  icon: Icon,
  title,
  cta,
  children,
}: {
  href: string;
  icon: typeof Heart;
  title: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="group flex flex-col rounded-xl bg-subtle p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <Icon className="size-6 text-brand" aria-hidden="true" />
      <span className="mt-3 font-display text-lg font-bold">{title}</span>
      <span className="mt-1 text-sm text-muted">{children}</span>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
        {cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
