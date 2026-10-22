import { CircleUser, Heart, Home, Menu, Search } from "lucide-react";
import Link from "next/link";
import { hasSession } from "~/lib/account";
import { CityInput } from "./fields";

/** Área do lojista mora no painel Carbud (cadastro de loja e login). */
function panelHref(path = ""): string {
  const base = (process.env.PANEL_URL ?? "").trim().replace(/\/+$/, "");
  return `${base}${path}`;
}

const NAV = [
  { href: "/comprar", label: "Comprar" },
  { href: panelHref(), label: "Vender" },
  { href: "/lojas", label: "Lojas" },
  { href: "/favoritos", label: "Favoritos" },
];

export function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Carbud, página inicial" className="shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/carbud-logo.svg" alt="carbud" className={`w-auto ${className}`} />
    </Link>
  );
}

export async function Header() {
  // só a presença do cookie: validar a sessão no painel a cada página custaria uma ida por request
  const logged = await hasSession();
  const account = logged ? { href: "/conta", label: "Minha conta" } : { href: "/entrar", label: "Entrar / Cadastrar" };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 lg:h-[72px] lg:px-6">
        {/* menu mobile sem JavaScript: <details> abre e fecha sozinho */}
        <details className="relative lg:hidden">
          <summary aria-label="Abrir menu" className="grid size-11 place-items-center rounded-lg">
            <Menu className="size-6" aria-hidden="true" />
          </summary>
          <nav className="absolute left-0 top-12 w-56 rounded-xl border border-line bg-white p-2 shadow-lg">
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-subtle">
                {item.label}
              </Link>
            ))}
            <Link href={account.href} className="block rounded-lg px-3 py-3 text-sm font-semibold text-brand hover:bg-subtle">
              {account.label}
            </Link>
            <a href={panelHref("/login")} className="block rounded-lg px-3 py-3 text-sm text-muted hover:bg-subtle">
              Área do lojista
            </a>
          </nav>
        </details>

        <Logo className="h-7 lg:h-9" />

        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex" aria-label="Principal">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} className="relative py-1 text-sm font-medium text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-300 hover:text-brand hover:after:scale-x-100">
              {item.label}
            </Link>
          ))}
        </nav>

        <form action="/comprar" className="hidden w-56 lg:block">
          <label htmlFor="header-cidade" className="sr-only">Cidade ou CEP</label>
          <CityInput id="header-cidade" />
        </form>

        <Link
          href={account.href}
          className="hidden min-h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover lg:inline-flex"
        >
          {logged && <CircleUser className="size-4" aria-hidden="true" />}
          {account.label}
        </Link>

        <Link href="/favoritos" aria-label="Favoritos" className="ml-auto grid size-11 place-items-center lg:hidden">
          <Heart className="size-6" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-subtle">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-8 text-sm lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <p className="text-ink">
          <strong className="font-display">carbud</strong> • Mais clareza para encontrar seu próximo carro.
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-muted" aria-label="Rodapé">
          <Link href="/lojas" className="hover:text-ink">Lojas</Link>
          <a href={panelHref()} className="hover:text-ink">Anuncie sua loja</a>
          <a href={panelHref("/login")} className="hover:text-ink">Área do lojista</a>
          <Link href="/termos" className="hover:text-ink">Termos</Link>
          <Link href="/privacidade" className="hover:text-ink">Privacidade</Link>
        </nav>
      </div>
    </footer>
  );
}

const TABS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/comprar", label: "Busca", icon: Search },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/conta", label: "Conta", icon: CircleUser },
];

/** Barra de abas do mobile (Figma 01 / Mobile). Some na ficha, que tem a barra de contato. */
export function TabBar() {
  return (
    <nav
      aria-label="Atalhos"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] text-muted hover:text-brand">
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
