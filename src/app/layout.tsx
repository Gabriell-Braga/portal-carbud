import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { Footer, Header, TabBar } from "~/components/chrome";
import { siteUrl } from "~/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Carbud — carros usados e seminovos à venda",
    template: "%s | Carbud",
  },
  description:
    "Compare veículos, encontre boas ofertas e converse diretamente com quem está vendendo.",
  icons: { icon: "/brand/carbud-icon.svg" },
  openGraph: { siteName: "Carbud", locale: "pt_BR", type: "website" },
};

export const viewport: Viewport = { themeColor: "#c6000f" };

export default function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans antialiased">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
        <TabBar />
        {modal}
      </body>
    </html>
  );
}
