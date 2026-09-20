# Trimly — Plataforma de Gestão e Agendamento para Barbearias

Sistema SaaS completo para barbearias desenvolvido em **Next.js**, **TypeScript**, **Supabase** (PostgreSQL + Auth), **Drizzle ORM** e **Stripe**.

---

## Sumário
1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Variáveis de Ambiente](#variáveis-de-ambiente)
3. [Configuração Manual no Stripe Dashboard](#configuração-manual-no-stripe-dashboard)
4. [Como Testar o Fluxo Completo Localmente (Stripe CLI)](#como-testar-o-fluxo-completo-localmente-stripe-cli)
5. [Configuração do Webhook e Deploy na Vercel](#configuração-do-webhook-e-deploy-na-vercel)
6. [Controle de Acesso e Regras de Negócio](#controle-de-acesso-e-regras-de-negócio)

---

## 1. Visão Geral da Arquitetura

- **Assinatura do Estabelecimento**: O dono da barbearia contrata o plano recorrente através do **Stripe Checkout**.
- **Agendamento de Clientes**: Clientes finais agendam cortes gratuitamente pelo link público da barbearia (ex: `/agendar/nome-barbearia`) **sem passar pelo Stripe**.
- **Autenticação**: Gerenciada pelo **Supabase Auth** (`auth.users`).
- **Banco de Dados**: A tabela `barbershops` armazena `owner_id` (vinculado ao usuário autenticado), `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id` e `subscription_status`.
- **Proteção de Rotas**: O `middleware.ts` valida se o usuário possui status `active` ou `trialing`. Usuários sem assinatura ativa são redirecionados para `/assinar`.

---

## 2. Variáveis de Ambiente

Crie ou atualize o arquivo `.env` na raiz do projeto com as seguintes chaves:

```env
# ─── Supabase ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_supabase
DATABASE_URL=postgresql://postgres:senha@host:6543/postgres

# ─── Stripe (Modo de Teste) ──────────────────────────────────────────────────
# Chave secreta — USO EXCLUSIVO NO SERVIDOR. NUNCA use NEXT_PUBLIC_ aqui.
STRIPE_SECRET_KEY=sk_test_...

# Chave publicável — opcional no client
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Segredo do Webhook gerado pela Stripe CLI (local) ou no Stripe Dashboard (produção)
STRIPE_WEBHOOK_SECRET=whsec_...

# ID do Preço recorrente criado no Stripe Dashboard (ex: price_1Q...)
STRIPE_PRICE_ID=price_...

# URL base da aplicação
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ─── Bypass de Assinatura (Opcional - Apenas Desenvolvimento) ───────────────
# E-mails separados por vírgula para testar o painel sem assinar no Stripe
SUBSCRIPTION_BYPASS_EMAILS=
```

> ⚠️ **IMPORTANTE DE SEGURANÇA**:
> - Nunca adicione chaves reais ao controle de versão (`git`). O arquivo `.env` está no `.gitignore`.
> - Apenas `NEXT_PUBLIC_` é exposto ao navegador. `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` são restritos ao servidor.

---

## 3. Configuração Manual no Stripe Dashboard

Para iniciar em modo de teste:

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com).
2. Ative a chave **"Test mode"** (Modo de teste) no topo da tela.
3. Vá em **Catálogo de Produtos (Product Catalog)** → Clique em **+ Adicionar Produto**.
4. Configure o produto:
   - **Nome**: `Trimly Pro` (ou `Plano Mensal Trimly`)
   - **Descrição**: `Acesso completo à plataforma de gestão para barbearias`
   - **Modelo de Preço**: Preço recorrente (Recurring)
   - **Preço**: `R$ 29,90`
   - **Período de cobrança**: Mensal (Monthly)
5. Salve o produto.
6. Copie o **ID do Preço** gerado (começa com `price_...`) e cole na variável `STRIPE_PRICE_ID` no seu `.env`.
7. Vá em **Developers (Desenvolvedores)** → **API keys (Chaves de API)**:
   - Copie a **Secret key** (`sk_test_...`) e cole em `STRIPE_SECRET_KEY`.
   - Copie a **Publishable key** (`pk_test_...`) e cole em `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

---

## 4. Como Testar o Fluxo Completo Localmente (Stripe CLI)

Para testar localmente sem precisar expor portas para a internet:

### Passo 1: Instalar a Stripe CLI
- **Windows (via Scoop ou Chocolatey ou instalador direto)**:
  ```powershell
  scoop install stripe
  # ou baixe o executável em https://github.com/stripe/stripe-cli/releases
  ```
- **Login na sua conta**:
  ```bash
  stripe login
  ```

### Passo 2: Encaminhar Webhooks para o servidor local
No terminal, execute:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
*(Se sua aplicação estiver rodando na porta 3001, ajuste para `localhost:3001/api/stripe/webhook`)*

A Stripe CLI exibirá uma linha similar a:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxx
```
Copie essa chave `whsec_...` e cole em `STRIPE_WEBHOOK_SECRET` no seu arquivo `.env`.

### Passo 3: Testar o Fluxo
1. Inicie o servidor Next.js:
   ```bash
   npm run dev
   ```
2. Crie uma conta ou faça login em `/login`.
3. Tente acessar `/dashboard`. O middleware irá redirecioná-lo para `/assinar`.
4. Na página `/assinar`, clique em **Começar 7 Dias Grátis**.
5. Você será redirecionado para a página segura do **Stripe Checkout**:
   - Use o cartão de teste do Stripe: `4242 4242 4242 4242`
   - Qualquer validade futura (ex: `12/28`) e qualquer CVC (ex: `123`).
6. Conclua o checkout.
7. Você será redirecionado para `/assinar/sucesso`.
8. No terminal do `stripe listen`, você verá os eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `invoice.paid`
9. O webhook atualizará a barbearia no banco com `subscription_status: 'trialing'` ou `'active'`.
10. Clique em **Acessar o Painel** ou entre em `/dashboard` — o acesso estará 100% liberado!

---

## 5. Configuração do Webhook e Deploy na Vercel

Quando fizer o deploy na **Vercel**:

### 1. Configurar Variáveis na Vercel
No painel do projeto na Vercel:
- Acesse **Settings** → **Environment Variables**.
- Adicione:
  - `STRIPE_SECRET_KEY`: sua chave de teste ou produção (`sk_...`).
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: sua chave pública (`pk_...`).
  - `STRIPE_PRICE_ID`: o ID do preço criado no Stripe.
  - `NEXT_PUBLIC_SITE_URL`: `https://trimly-mk.vercel.app`.

### 2. Cadastrar o Endpoint no Stripe Dashboard
1. No Stripe Dashboard, vá em **Developers (Desenvolvedores)** → **Webhooks**.
2. Clique em **+ Add endpoint (Adicionar endpoint)**.
3. No campo **Endpoint URL**, insira:
   ```
   https://trimly-mk.vercel.app/api/stripe/webhook
   ```
4. Em **Events to send (Eventos a enviar)**, selecione:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Clique em **Add endpoint**.
6. Clique em **Reveal signing secret (Revelar segredo de assinatura)**.
7. Copie o valor (`whsec_...`) e adicione como `STRIPE_WEBHOOK_SECRET` nas Environment Variables da Vercel.

---

## 6. Controle de Acesso e Regras de Negócio

| Status da Assinatura | Descrição | Acesso ao Painel |
|---|---|---|
| `trialing` | Período de teste de 7 dias ativo | ✅ Liberado |
| `active` | Assinatura paga e em dia | ✅ Liberado |
| `past_due` | Falha no pagamento da fatura | ❌ Bloqueado (redireciona para `/assinar`) |
| `canceled` | Assinatura cancelada pelo cliente | ❌ Bloqueado |
| `unpaid` | Fatura não paga após retentativas | ❌ Bloqueado |
| `incomplete` | Pagamento inicial não concluído | ❌ Bloqueado |
| `null` | Usuário sem assinatura cadastrada | ❌ Bloqueado |

---

## 7. Gerenciamento de Assinatura pelo Barbeiro (Customer Portal)

Dentro do painel administrativo, em `/dashboard/assinatura`, o barbeiro pode clicar em **Gerenciar Assinatura**. O sistema utiliza a API do **Stripe Billing Portal**, permitindo ao cliente:
- Atualizar cartão de crédito.
- Baixar notas e faturas.
- Cancelar ou reativar sua assinatura com segurança.
