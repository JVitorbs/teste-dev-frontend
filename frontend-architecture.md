## Plan: Arquitetura Frontend Mini Twitter

Definir uma especificação técnica completa (sem implementar código) para um frontend React + TypeScript que consuma o backend existente, cobrindo todos os requisitos funcionais obrigatórios no MVP. Extras solicitados (dark mode, estado global, scroll infinito) ficam documentados como evolução pós-MVP com desenho técnico pronto para ativação.

**Steps**
1. Consolidar contratos da API e regras de negócio reais do backend em uma seção de referência única. *base para todos os passos seguintes*
2. Definir arquitetura de frontend em camadas (UI, formulários, estado remoto, cliente HTTP, autenticação local), incluindo decisões de stack: React, TypeScript, Axios, TanStack Query, React Hook Form, Zod, Tailwind CSS. *depends on 1*
3. Especificar modelo de domínio e tipagem TypeScript (AuthUser, AuthToken, Post, PaginatedPosts, ApiError) e mapeamento de payloads de cada endpoint para tipos do cliente. *depends on 1*
4. Desenhar fluxos funcionais do MVP: registro, login, logout, timeline paginada, busca dinâmica, criação de post (com validação de imagem), edição/exclusão próprias, like/unlike com atualização imediata de interface. *depends on 2,3*
5. Definir estratégia de roteamento e proteção de acesso (rotas públicas/privadas), persistência do JWT em localStorage e comportamento de sessão em erros 401/403. *depends on 4*
6. Definir estratégia de cache/invalidação com TanStack Query para cada ação mutável (create/update/delete/like/logout), incluindo otimização de feedback visual para likes e recomputação da timeline. *depends on 4*
7. Definir especificação de UX/UI com Tailwind para componentes principais (AuthForm, Timeline, PostCard, PostComposer, SearchBar, Pagination), critérios de responsividade e mensagens de erro amigáveis exigidas no escopo. *parallel with 6*
8. Planejar evolução pós-MVP em trilhas independentes: modo dark (theme class), estado global (Zustand/Context para sessão/tema), scroll infinito (useInfiniteQuery com cursor por page). *depends on 6,7*
9. Produzir artefato final de documentação com backlog executável por fases (MVP obrigatório e Fase 2 extras), critérios de aceite testáveis e checklist de handoff para implementação. *depends on 1-8*

**Relevant files**
- `/home/joao-vitor-bs/teste_dev/teste-dev-frontend/mini-twitter-backend-main/src/routes/auth.routes.ts` — fonte oficial dos contratos de `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`.
- `/home/joao-vitor-bs/teste_dev/teste-dev-frontend/mini-twitter-backend-main/src/routes/post.routes.ts` — contratos de timeline paginada/busca, CRUD de posts e like toggle.
- `/home/joao-vitor-bs/teste_dev/teste-dev-frontend/mini-twitter-backend-main/src/services/post.service.ts` — regras de negócio relevantes ao frontend: paginação (limit 10), busca por título, ownership e likes.
- `/home/joao-vitor-bs/teste_dev/teste-dev-frontend/mini-twitter-backend-main/src/services/auth.service.ts` — comportamento de autenticação e invalidação de sessão via blacklist.
- `/home/joao-vitor-bs/teste_dev/teste-dev-frontend/mini-twitter-backend-main/README.md` — ponto recomendado para anexar seção de integração frontend/API e fluxos de uso.
- `/home/joao-vitor-bs/teste_dev/teste-dev-frontend/mini-twitter-backend-main/docs/frontend-architecture.md` — documento a ser criado na implementação para consolidar arquitetura, contratos e backlog técnico.

**Verification**
1. Conferir rastreabilidade requisito -> endpoint: cada critério funcional do MVP aponta explicitamente para rota/método/erro correspondente do backend.
2. Validar que todos os critérios de aceitação obrigatórios foram convertidos em comportamento observável de frontend (mensagem, redirecionamento, validação, visibilidade de ação, atualização de estado).
3. Revisar consistência técnica entre stack proposta e responsabilidades: TanStack Query (estado remoto), RHF+Zod (form), Axios (HTTP), Tailwind (UI), TypeScript (tipos).
4. Confirmar plano de erros HTTP críticos: 400 (registro duplicado), 401 (credenciais/token), 403 (edição/exclusão não autorizada), 404 (post inexistente).
5. Confirmar segmentação por fases: MVP obrigatório isolado de extras; extras documentados com dependências e impacto estimado.

**Decisions**
- Incluído no MVP: somente requisitos funcionais obrigatórios dos épicos de autenticação, timeline, busca, criação, edição/exclusão próprias e likes.
- Excluído do MVP inicial: implementação dos extras (dark mode, estado global e scroll infinito), mas com arquitetura já desenhada para fase seguinte.
- Escopo desta entrega: documentação/arquitetura, sem criação de projeto frontend e sem alterações de código de produção.

**Further Considerations**
1. Formato de documentação: recomendação de um documento principal (`docs/frontend-architecture.md`) + matriz de requisitos no README para facilitar onboarding.
2. Estado global na Fase 2: recomendação inicial de Context API para sessão/tema; migrar para Zustand apenas se houver expansão de complexidade.
3. Scroll infinito na Fase 2: como o backend usa `page`, implementar `useInfiniteQuery` com `getNextPageParam` baseado em `total` e `limit`.