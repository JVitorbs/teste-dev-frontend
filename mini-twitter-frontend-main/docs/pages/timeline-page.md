# Pagina Tecnica - TimelinePage

Arquivo base: `src/pages/TimelinePage.tsx`

## 1. Objetivo

`TimelinePage` e o centro funcional da aplicacao. Ela combina:

- leitura de feed paginado
- busca
- criacao/edicao/exclusao
- curtida com otimizacao
- logout e navegacao
- experiencia desktop e mobile

## 2. Responsabilidades funcionais

1. Carregar e renderizar posts paginados.
2. Reagir a busca por titulo (`search`).
3. Permitir criar post (autenticado).
4. Permitir editar/deletar post do proprio autor.
5. Permitir curtir/descurtir com update otimista.
6. Exibir modal detalhado do post.
7. Controlar menu lateral mobile com animacao.
8. Encerrar sessao via logout.

## 3. Estados locais e sua finalidade

| Estado | Tipo | Responsabilidade |
|---|---|---|
| `search` | `string` | termo de busca usado no `queryKey` |
| `message` | `string` | feedback textual inline |
| `likedByMe` | `Record<number, boolean>` | estado local de curtidas por post |
| `expandedPostId` | `number \| null` | controla modal de detalhe |
| `mobileMenuOpen` | `boolean` | abre/fecha drawer mobile |

## 4. Dependencias principais

| Categoria | Modulos |
|---|---|
| Query/Mutation | `useInfiniteQuery`, `useMutation`, `useQueryClient` |
| Servicos | `postService`, `authService` |
| Contexto | `useAuth` |
| Componentes | `PostComposer`, `PostCard`, `ThemeToggleButton` |
| Utilitarios | `getApiError`, `toast` |
| Icones | `Heart`, `Menu`, `X` |

## 5. Modelo de dados consumido

- Entrada principal: `PostsResponse`
- Lista renderizada: `PostItem[]`
- Mutacoes usam `PostPayload`/`PostSchema`
- Like retorna `{ liked: boolean }`

## 6. Estrategia de query e cache

### Query base

- `queryKey(search) => ['posts', search]`
- `queryFn`: `postService.list(pageParam, search)`
- `getNextPageParam`: calculado por `total` e `limit`

### Comportamento de invalidacao

- `createMutation`: invalida `['posts']`
- `updateMutation`: invalida `['posts']`
- `deleteMutation`: invalida `['posts']`

### Otimizacao de like

- `onMutate`:
  - cancela queries
  - gera snapshot
  - aplica update otimista de `likesCount`
- `onError`:
  - rollback para snapshot

## 7. Fluxo de dados - leitura e interacao

```mermaid
flowchart TB
  QUERY[useInfiniteQuery posts] --> SERVICE[postService.list]
  SERVICE --> API[Axios api]
  API --> BACK[Backend /posts]
  BACK --> QUERY
  QUERY --> LISTA[allPosts via useMemo]
  LISTA --> CARD[Lista de PostCard]

  SEARCH[input search] --> QUERYKEY[queryKey por search]
  QUERYKEY --> QUERY

  CREATE[createMutation] --> INVALIDATE[invalidateQueries posts]
  UPDATE[updateMutation] --> INVALIDATE
  DELETE[deleteMutation] --> INVALIDATE

  LIKE[likeMutation onMutate] --> OPT[update otimista likes]
  OPT --> CARD
  LIKE --> ROLLBACK[rollback em erro]
```

## 8. Fluxo detalhado - criacao de post

```mermaid
sequenceDiagram
  participant U as Usuario
  participant C as PostComposer
  participant T as TimelinePage
  participant M as createMutation
  participant S as postService
  participant Q as QueryClient

  U->>C: envia formulario
  C->>T: onSubmitPost(payload)
  T->>M: mutateAsync(payload)
  M->>S: create(payload)
  S-->>M: sucesso
  M-->>T: onSuccess
  T->>T: toast.success + setMessage
  T->>Q: invalidateQueries(posts)
```

## 9. Fluxo detalhado - like otimista

```mermaid
sequenceDiagram
  participant U as Usuario
  participant T as TimelinePage
  participant Q as QueryClient
  participant S as postService

  U->>T: click curtir
  T->>Q: cancelQueries(posts)
  T->>Q: snapshot previous
  T->>Q: setQueryData otimista
  T->>T: setLikedByMe local
  T->>S: like(postId)

  alt sucesso
    S-->>T: liked true ou false
    T->>T: sincroniza likedByMe
  else erro
    S-->>T: erro
    T->>Q: restaura snapshot
    T->>T: setMessage erro
  end
```

## 10. Fluxo de logout

```mermaid
flowchart LR
  BTN[Botao sair] --> MUT[logoutMutation]
  MUT --> OK{sucesso}
  OK -- Sim --> CLEAR[clearSession AuthContext]
  CLEAR --> NAV[navigate /auth replace]
  OK -- Nao --> MSG[setMessage erro logout]
```

## 11. Composicao de componentes

```mermaid
flowchart TB
  TL[TimelinePage]
  TL --> ASIDE1[Sidebar esquerda desktop]
  TL --> MAIN[Secao principal]
  TL --> ASIDE2[Sidebar direita destaques]
  TL --> DRAWER[Drawer mobile animado]
  TL --> MODAL[Modal de post expandido]

  MAIN --> HEADER[Header timeline]
  MAIN --> SEARCH[Input de busca]
  MAIN --> COMPOSER[PostComposer autenticado]
  MAIN --> FEED[Lista PostCard]

  FEED --> POSTCARD[PostCard]
  MODAL --> LIKEBTN[Botao de like no modal]
```

## 12. Regras de permissao

- Sem autenticacao:
  - nao pode criar, editar, deletar, curtir
  - recebe CTA para login
- Com autenticacao:
  - pode interagir
  - so autor pode editar/deletar

## 13. Responsividade

### Desktop

- 3 colunas em grade
- sidebar de navegacao fixa
- painel de destaques fixo em telas grandes

### Mobile

- botao `Abrir menu` no header
- drawer lateral com overlay
- animacao de abertura simulando painel "abrindo" (slide, opacity e blur)

## 14. Tratamento de erro por mutacao

| Mutacao | Tratamento |
|---|---|
| Criar | `getApiError` + mensagem |
| Editar | `403` especifico + fallback |
| Deletar | `403` especifico + fallback |
| Curtir | rollback otimista + mensagem |
| Logout | mensagem de falha |

## 15. Checklist de manutencao

1. Alterou pagina ou limite do backend? revisar `getNextPageParam`.
2. Alterou contrato de post? revisar `types/api.ts`, `post.service.ts` e `PostCard`.
3. Alterou like endpoint? revisar mutacao otimista e rollback.
4. Alterou menu mobile? validar acessibilidade (`aria-label`) e testes.

## 16. Testes relacionados

- `src/pages/__tests__/TimelinePage.test.tsx`
- `src/components/__tests__/PostCard.test.tsx`
- `src/components/__tests__/PostComposer.test.tsx`
- `src/services/__tests__/post.service.test.ts`
