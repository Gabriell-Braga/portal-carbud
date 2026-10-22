# Portal Carbud

Marketplace público com os carros de todas as revendas do Carbud CRM. Next.js 15 (App Router) + Tailwind v4, hospedado na Vercel. Não tem banco: lê tudo do painel Carbud por HTTP.

## Rodando local

```bash
npm install
cp .env.example .env.local   # PANEL_URL=http://localhost:3000 com o painel (../carbud) rodando
npm run dev                  # http://localhost:3200
```

## Deploy na Vercel

1. Importar o repositório (framework Next.js, sem Root Directory).
2. Variáveis de ambiente (Production e Preview):

| Nome | Exemplo | Para quê |
|---|---|---|
| `PANEL_URL` | `https://crm.carbud.com.br/app` | Painel, **com** o mount path. Obrigatória: o build falha sem ela |
| `SITES_API_KEY` | (mesmo valor do painel) | Exigida pelo painel quando ele define `SITES_API_KEY` |
| `SITE_URL` | `https://carbud.com.br` | Canonical, sitemap e Open Graph |

3. Domínio `carbud.com.br` (e `www`) no projeto.

**Antes do primeiro deploy**, o painel precisa estar publicado com as rotas `/api/public/portal/*` (branch `portal-publico` do repositório `carbud`). Sem elas a home e a busca respondem erro.

## Rotas

| Rota | O quê |
|---|---|
| `/` | Home: busca, vitrine, orçamento, categorias |
| `/comprar` | Busca com filtros (estado na URL) |
| `/veiculo/[loja]/[slug]` | Ficha + contato (mensagem / WhatsApp com pré-captura) |
| `/lojas`, `/loja/[slug]` | Lojas e estoque de cada uma |
| `/favoritos` | Salvos no navegador |
| `/privacidade`, `/termos` | Textos-base, **pendentes de revisão jurídica** |
