# Documentacao Tecnica - Mini Twitter Frontend

Esta pasta concentra a documentacao tecnica detalhada do frontend `mini-twitter-frontend-main` com base no codigo atual do projeto.

O foco deste material e permitir que qualquer pessoa do time consiga:

- entender arquitetura e responsabilidades de cada camada
- navegar rapidamente por pagina, componente, contexto e servico
- manter e evoluir o frontend com menor risco de regressao
- depurar fluxos de autenticacao, timeline, cache e navegacao

## Como ler esta documentacao

Ordem recomendada de leitura:

1. `docs/01-visao-geral-frontend.md`
2. `docs/pages/app-routing.md`
3. `docs/pages/auth-page.md`
4. `docs/pages/timeline-page.md`
5. `docs/componentes-compartilhados.md`

## Mapa de documentos

| Documento | Objetivo principal | Quando consultar |
|---|---|---|
| `docs/01-visao-geral-frontend.md` | Arquitetura geral, camadas, estado, contratos e ciclo de runtime | Onboarding e entendimento macro |
| `docs/pages/app-routing.md` | Regras de rotas, guardas de acesso e comportamento de redirecionamento | Alteracao de navegacao e autenticacao |
| `docs/pages/auth-page.md` | Fluxos de login/cadastro, validacao, mensagens e mutacoes | Mudancas em autenticacao |
| `docs/pages/timeline-page.md` | Fluxos da timeline, cache, mutacoes, modal e menu mobile | Mudancas no feed e interacoes |
| `docs/componentes-compartilhados.md` | Contextos, componentes reutilizaveis, servicos, utilitarios e tipos | Manutencao de infraestrutura de UI e dados |

## Escopo tecnico coberto

- Runtime e bootstrap (`main.tsx`)
- Providers globais (`QueryClientProvider`, `ThemeProvider`, `AuthProvider`)
- Roteamento (`App.tsx`, `ProtectedRoute`)
- Paginas (`AuthPage`, `TimelinePage`)
- Componentes de dominio (`PostCard`, `PostComposer`, `ThemeToggleButton`)
- Camada de dados (`services/*`, `lib/api.ts`, `TanStack Query`)
- Persistencia local (`lib/storage.ts`)
- Validacao (`schemas/*` com Zod)
- Tratamento de erro (`lib/error.ts`)
- Feedback de usuario (`Toaster` + `sonner`)

## Convencoes de modelagem usadas aqui

- "Heranca" no contexto React e tratada como **hierarquia/composicao** de componentes.
- Diagramas Mermaid desta pasta cobrem:
  - fluxo de dados
  - fluxo funcional
  - sequencia de eventos
  - composicao de componentes
  - dependencias entre modulos
- Todos os exemplos refletem o codigo atual, nao uma proposta futura.

## Observacoes de manutencao

- Ao alterar contrato de API, atualizar primeiro `src/types/api.ts` e os documentos de pagina impactados.
- Ao alterar fluxos de auth ou rotas protegidas, revisar `docs/pages/app-routing.md` e `docs/pages/auth-page.md`.
- Ao alterar mutacoes da timeline, revisar `docs/pages/timeline-page.md` (sessao de cache e invalidacao).
