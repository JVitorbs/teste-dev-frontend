# Pagina Tecnica - AuthPage

Arquivo base: `src/pages/AuthPage.tsx`

## 1. Objetivo

`AuthPage` centraliza autenticacao do usuario com dois fluxos:

- cadastro de conta
- login com criacao de sessao

Em caso de login bem-sucedido, a pagina persiste sessao e redireciona para timeline.

## 2. Responsabilidades funcionais

1. Renderizar layout institucional da landing de autenticacao.
2. Exibir logo e area de branding.
3. Controlar alternancia de abas (`login` e `register`).
4. Validar entradas com schemas Zod.
5. Executar mutacoes de auth e tratar estados de pending/success/error.
6. Mostrar feedback por toast e mensagem textual.
7. Criar sessao (`token` + `user`) via `AuthContext` no login.

## 3. Dependencias tecnicas

| Categoria | Modulos |
|---|---|
| Formulario | `react-hook-form`, `zodResolver`, `schemas/auth.ts` |
| Dados remotos | `useMutation` (`@tanstack/react-query`) |
| Integracao auth | `services/auth.service.ts` |
| Sessao global | `context/AuthContext.tsx` |
| Navegacao | `useNavigate` (`react-router-dom`) |
| UI | `Card`, `Input`, `Button`, `Tabs`, `Badge`, `ThemeToggleButton` |
| Erro/feedback | `getApiError`, `toast` (`sonner`) |

## 4. Estado interno da pagina

| Estado | Tipo | Funcao |
|---|---|---|
| `mode` | `"login" | "register"` | controla aba ativa |
| `apiMessage` | `string` | mensagem textual de retorno para usuario |

## 5. Form schemas e regras

Arquivo: `src/schemas/auth.ts`

- Cadastro:
  - `name` minimo 2
  - `email` valido
  - `password` minimo 4
- Login:
  - `email` valido
  - `password` obrigatoria

## 6. Fluxo de dados de alto nivel

```mermaid
flowchart LR
  UI[Campos de formulario] --> RHF[React Hook Form]
  RHF --> ZOD[Schema auth]
  ZOD --> MUT[Mutation TanStack Query]
  MUT --> SVC[authService]
  SVC --> API[Axios API]
  API --> BACK[Backend]

  MUT --> OK{Sucesso}
  OK -- Sim --> SESSION[setSession AuthContext]
  SESSION --> STORAGE[localStorage token user]
  OK -- Sim --> TOAST[toast.success]
  OK -- Sim --> NAV[navigate timeline]
  OK -- Nao --> MSG[apiMessage via getApiError]
```

## 7. Fluxo detalhado - Cadastro

```mermaid
sequenceDiagram
  participant U as Usuario
  participant P as AuthPage
  participant F as registerForm
  participant M as registerMutation
  participant S as authService
  participant B as Backend

  U->>F: preenche nome email senha
  U->>P: submit registrar
  P->>M: mutate(values)
  M->>S: register(payload)
  S->>B: POST /auth/register
  B-->>S: resposta
  S-->>M: data

  alt sucesso
    M-->>P: onSuccess
    P->>P: toast.success
    P->>P: setApiMessage conta criada
    P->>P: setMode login
    P->>F: reset()
  else erro 400
    M-->>P: onError
    P->>P: mensagem email em uso
  else erro geral
    M-->>P: onError
    P->>P: getApiError fallback
  end
```

## 8. Fluxo detalhado - Login

```mermaid
sequenceDiagram
  participant U as Usuario
  participant P as AuthPage
  participant M as loginMutation
  participant S as authService
  participant A as AuthContext
  participant R as Router

  U->>P: submit login
  P->>M: mutate(values)
  M->>S: login(payload)
  S->>R: POST /auth/login
  R-->>S: token + user
  S-->>M: LoginResponse
  M-->>P: onSuccess
  P->>P: toast.success bem-vindo
  P->>A: setSession(token,user)
  P->>R: navigate /timeline replace true
```

## 9. Composicao de componentes

```mermaid
flowchart TB
  AUTH[AuthPage]
  AUTH --> LEFT[Card institucional]
  AUTH --> RIGHT[Card formulario]

  LEFT --> BADGE[Badge logo]
  LEFT --> H1[Headline]
  LEFT --> P1[Descricao]

  RIGHT --> TOP[Titulo + ThemeToggleButton]
  RIGHT --> TABS[Tabs]
  TABS --> REG[Tab registrar]
  TABS --> LOG[Tab login]

  REG --> FR[Form register]
  FR --> IN1[Input nome]
  FR --> IN2[Input email]
  FR --> IN3[Input senha]
  FR --> B1[Botao criar conta]

  LOG --> FL[Form login]
  FL --> IN4[Input email]
  FL --> IN5[Input senha]
  FL --> B2[Botao entrar]
```

## 10. Estrategia de erro

| Fluxo | Condicao | Comportamento |
|---|---|---|
| Cadastro | HTTP 400 | mensagem especifica de email em uso |
| Cadastro | Outros erros | `getApiError` com fallback |
| Login | Erro geral | `getApiError` com fallback credenciais |

## 11. Contratos de entrada e saida

- Entrada registro: `RegisterPayload`
- Entrada login: `LoginPayload`
- Saida login: `LoginResponse`

## 12. Checklist para manutencao

1. Alterou schema de auth? Atualize `schemas/auth.ts` + testes.
2. Alterou endpoint de auth? Atualize `services/auth.service.ts` + docs.
3. Alterou formato de `LoginResponse`? Atualize `types/api.ts` + `AuthContext`.
4. Alterou feedback de usuario? Revalidar `toast` e `apiMessage`.

## 13. Testes relacionados

- `src/pages/__tests__/AuthPage.test.tsx`
- `src/schemas/__tests__/auth.test.ts`
- `src/services/__tests__/auth.service.test.ts`
- `src/context/__tests__/AuthContext.test.tsx`
