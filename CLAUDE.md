# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Portal Carbud: marketplace público (carbud.com.br) com o estoque de todas as revendas que usam o Carbud CRM. Interface e textos em pt-BR; código e identificadores em inglês. Comentário explica o porquê, não o quê.

## Comandos

```bash
npm run dev        # porta 3200; precisa do painel de pé (PANEL_URL no .env.local)
npm run build      # falha cedo se PANEL_URL não estiver definida (next.config.ts)
npm run check      # typecheck + testes
npm test           # node:test, sem framework: src/lib/*.test.ts
node --test --experimental-strip-types src/lib/format.test.ts   # um arquivo
```

Desenvolvimento local: suba o painel do repositório `../carbud` (`npm run dev`, porta 3000, D1 local com a demo) e use `PANEL_URL=http://localhost:3000`.

Windows: derrube o `npm run dev` antes de `npm run build` e apague `.next` entre os dois; dev e build no mesmo `.next` geram rotas 404/500 falsas.

## Arquitetura

- **Sem banco.** O D1 é binding do Cloudflare e só existe dentro do painel (Webflow Cloud, repo `carbud`). Tudo vem de HTTP via `src/lib/panel.ts`:
  - `GET /api/public/portal/vehicles` — busca cross-revenda; mesma query string do site da revenda (`q`, `marca`, `modelo`, `cambio`, `combustivel`, `carroceria`, `precoMin/Max` em reais, `anoMin/Max`, `kmMax`, `ordem`, `pagina`) mais `loja`, `cidade`, `uf`. Página fixa de 12.
  - `GET /api/public/portal/dealers` — lojas no ar com contagem de anúncios.
  - `GET /api/public/site/[slug]` e `/api/public/site/[slug]/vehicles/[vehicleSlug]` — dados da loja (`available` decide se aparece) e ficha. Rotas do app dos sites, reaproveitadas.
  - `POST /api/leads` do painel, sempre pelo proxy `src/app/api/leads/route.ts`.
  - `portal/auth/*` e `portal/me*` — conta de comprador (Bearer com o token da sessão).
  As rotas `portal/*` vivem no repo `carbud` (`src/app/api/public/portal/`); mudar o contrato exige mudar os dois lados. Tipos espelhados à mão em `src/lib/types.ts`/`catalog.ts` (este repo não enxerga `@carbud/site-kit`).
- **Header `x-sites-key`**: `SITES_API_KEY` precisa ser igual à do painel quando ele define uma; sem ela as rotas respondem 401.
- **Fotos**: o painel devolve `/<mount>/api/media/...`; `localMedia()` reescreve para `/media/...` e o `rewrites()` do `next.config.ts` encaminha ao painel (R2 é privado).
- **Páginas `force-dynamic`** de propósito: o build não pode depender do painel no ar. O cache fica no `fetch` (`next.revalidate` 60s).
- **Skeleton**: `lojas/loading.tsx` e, na busca e na loja, só a lista (`Pending` de `components/search-nav.tsx`) enquanto o filtro carrega. Nada de `loading.tsx` na raiz (o Suspense manda 200 antes do `notFound()` da ficha/loja) nem em `comprar/` (trocar cidade/marca/modelo muda o segmento e o esqueleto cobriria os filtros).
- **Fotos no card**: todo card de carro é carrossel (`CardPhotos`). `portal/vehicles` devolve até 6 fotos por carro (uma query em lote no painel); favoritos guardam as URLs em `photos` no retrato (antigos só têm `cover`). Card sem setas = carro com 1 foto ou nenhuma no painel.
- **URL é o estado da busca**: filtros são `<form method=get>`; `FilterPanel` e os campos de `components/fields.tsx` são as peças client da listagem. `SearchNav` intercepta o envio e os links da própria busca e navega sem recarregar (`router.push` numa transition); o formulário e o seletor de ordem levam `key` com os valores para remontar depois de chip/limpar.
- **Cidade, marca e modelo no caminho** (`lib/search-path.ts`): `/comprar/mg-belo-horizonte/gm-chevrolet/onix`, o resto na query. Formulários continuam mandando GET para `/comprar`; a página (`comprar/[[...filtros]]`) redireciona para o endereço canônico. O slug volta ao nome pelas facets da busca sem filtro; o que não está no catálogo fica na query, e caminho desconhecido dá 404.
- **Campos próprios** (`components/fields.tsx`): `Select` (listbox, `autoSubmit`), `MaskedInput` (R$, km, telefone, ano; dinheiro e km vão em dígitos por hidden), `CityInput` (sugestões + máscara de CEP) e a classe `.checkbox` do `globals.css`. Nada de `<select>`, `datalist` ou checkbox nativo. Constante de estilo usada por página do servidor fica fora do módulo client (`field-box.ts`).
- **Entrar em modal**: `@modal/(.)entrar` abre o login por cima da página na navegação interna; link direto cai em `/entrar`, mesmo cartão. Slot novo em `@modal` exige reiniciar o `npm run dev`.
- **Lead** (`components/contact.tsx` → `/api/leads`): valida, salva no painel e só então devolve `whatsappUrl`, montado no servidor com o WhatsApp cadastrado da loja. O WhatsApp nunca abre antes do lead salvo; consentimento LGPD obrigatório, já vem marcado por decisão de produto (a pessoa pode desmarcar e o envio é recusado). Atribuição vai em `utm.source = "carbud-portal"`.
- **Conta de comprador** (`/entrar`, `/conta`): código de 6 dígitos por e-mail, sem senha; sai pelo mesmo provedor do painel (`sendEmail`: Amazon SES ou Resend, o que estiver configurado em Super Admin → Configurações → E-mail). Conta e sessão vivem no painel (`portal/auth/*`, `portal/me*`); o portal guarda o token em cookie httpOnly `carbud_sessao` e fala com o painel só pelo proxy `src/app/api/conta/[...path]/route.ts`. `carbud_conta=1` é um cookie legível, sem segredo, que só avisa o navegador que há sessão. Sem provedor de e-mail e fora de produção, o painel devolve `devCode` e a tela mostra o código.
- **Entrar com Google** (`lib/google.ts`, `api/auth/google/*`): OAuth com redirecionamento, sem SDK. O portal troca o código pelo id_token e manda para `portal/auth/google`; o painel confere no tokeninfo do Google (`aud` = `GOOGLE_CLIENT_ID` do painel) e abre a sessão como no código por e-mail. Volta por `/entrar?sincronizar=1` para juntar os favoritos. Botão só aparece com `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; `GOOGLE_CLIENT_SECRET` só no servidor.
- **Favoritos**: `localStorage` é o que a tela lê; com sessão, cada mudança vai também para a conta e `syncFavorites` junta as duas listas no login e em `/favoritos`. Sair limpa a lista local. "Vender" e "Área do lojista" levam ao painel (`PANEL_URL`).
- **CEP**: "Cidade ou CEP" manda o CEP em `cidade`; `/comprar` troca pela cidade via ViaCEP (`lib/cep.ts`) e redireciona.

## Design

Fonte da verdade: Figma "Benchmark UX Automotivo — CarGurus × Webmotors × OLX | Wireframes" (páginas 01–05: mobile, contato e estados, desktop, sistema de design, handoff). Tokens em `src/app/globals.css` (`@theme`): `brand #C6000F`, Sora (títulos, `font-display`) + Inter. Card de carro: foto 4:3 sangrando no topo, por cima só coração, setas (só no hover) e contador "n/N"; selos e texto empilhados abaixo. Mobile-first; validar em 360/390/768/1024/1440.

Fora de propósito (não inventar dado): chat em tempo real, avaliações. Só entram quando o painel tiver o dado.

**Abaixo da FIPE**: o painel compara o preço com a FIPE salva no cadastro do carro (toda ficha consulta a FIPE). `portal/vehicles` aceita `abaixoFipe=1` e devolve `belowFipe` em cada carro; carro sem FIPE salva nunca entra.

**Destaques**: na busca do portal, destaque não sobe na lista. `portal/vehicles` devolve `highlights`: até 3 destaques dos mesmos filtros, em rodízio por minuto que passa uma vez por cada loja (`pickHighlights` no painel), então loja com 10 destaques aparece tanto quanto loja com 1. O `/comprar` mostra a faixa só na página 1, em "Mais relevantes" e sem nenhum filtro (inclui `q` e `loja`), e tira o selo dos carros da lista.

**Vistoriado e 360°**: mesmo esquema, regra no painel. `vistoriado=1` / `inspected` = laudo em PDF anexado, aprovado e com menos de um ano; `visao360=1` / `has360` = giro externo ou panorâmica do interior. A ficha recebe `inspection` (com link do laudo), `spin` (quadros) e `pano`; `components/viewer-360.tsx` mostra os dois sem dependência e só baixa os quadros quando a pessoa abre o giro.
