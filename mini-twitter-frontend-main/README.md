# Mini Twitter Frontend

Frontend do projeto Mini Twitter, desenvolvido com React + TypeScript, focado em autenticacao, timeline paginada, interacoes em posts e experiencia responsiva (desktop/mobile).

## Visao Geral

Este app consome a API do projeto e entrega os fluxos principais:

- cadastro e login
- protecao de rotas por sessao
- timeline com busca
- criacao, edicao e exclusao de posts
- curtida/descurtida com atualizacao otimista
- tema claro/escuro
- toasts de feedback
- menu lateral mobile com animacao

## Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Axios
- Tailwind CSS
- Sonner (toasts)
- Vitest + Testing Library

## Requisitos

- Node.js 20+
- npm 10+

## Variaveis de ambiente

Crie um arquivo `.env` (ou use o `docker-compose`) com:

```bash
VITE_API_URL=http://localhost:3000
```

Se nao definir, o frontend usa fallback para `http://localhost:3000`.

## Como rodar localmente

```bash
npm install
npm run dev
```

Aplicacao: `http://localhost:5173`

## Scripts

- `npm run dev`: ambiente de desenvolvimento
- `npm run build`: build de producao (TypeScript + Vite)
- `npm run preview`: serve build local
- `npm run lint`: lint do projeto
- `npm run test`: testes em watch
- `npm run test:run`: execucao unica dos testes

## Estrutura principal

```text
src/
  pages/
    AuthPage.tsx
    TimelinePage.tsx
  components/
    PostCard.tsx
    PostComposer.tsx
    ProtectedRoute.tsx
    ThemeToggleButton.tsx
    ui/
  context/
    AuthContext.tsx
    ThemeContext.tsx
  services/
    auth.service.ts
    post.service.ts
  lib/
    api.ts
    storage.ts
    error.ts
  schemas/
    auth.ts
    post.ts
  types/
    api.ts
```

## Arquitetura resumida

- `pages`: orquestram fluxo de tela
- `components`: blocos de UI e interacao
- `context`: estado global de sessao e tema
- `services`: camada de acesso a API
- `lib/api.ts`: cliente HTTP com interceptor de token
- `schemas`: validacao de formularios
- `types`: contratos TypeScript da API

## Rotas

- Publica:
  - `/auth`
- Protegidas:
  - `/`
  - `/timeline`

Rotas protegidas usam `ProtectedRoute` e redirecionam para `/auth` quando nao autenticado.

## Qualidade e testes

Cobertura de testes em:

- paginas
- componentes
- contexts
- services
- libs
- schemas

Para rodar tudo:

```bash
npm run test:run
```

## Documentacao tecnica detalhada

Consulte a pasta `docs/`:

- `docs/README.md`
- `docs/01-visao-geral-frontend.md`
- `docs/pages/app-routing.md`
- `docs/pages/auth-page.md`
- `docs/pages/timeline-page.md`
- `docs/componentes-compartilhados.md`

## Integracao com Docker

Este frontend pode ser executado via `docker compose` na raiz do workspace (`teste-dev-frontend`) junto com o backend.

```bash
docker compose up --build -d
```

## Status atual

- Fluxos principais implementados
- Testes do frontend passando
- Documentacao tecnica por pagina disponivel
