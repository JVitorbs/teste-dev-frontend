import { expect, test, type Page } from "@playwright/test";
import { seedAuthenticatedSession, setupMockApi } from "./helpers/mockApi";

const openTimelineAsAuthenticated = async (page: Page) => {
  await seedAuthenticatedSession(page);
  await setupMockApi(page);
  await page.goto("/timeline");
  await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
};

test("cria um novo post na timeline", async ({ page }) => {
  await openTimelineAsAuthenticated(page);

  await page.getByPlaceholder("Titulo do seu post").fill("Novo post E2E");
  await page.getByPlaceholder("Compartilhe uma ideia, dica ou opiniao...").fill("Conteudo criado em teste e2e.");
  await page.getByRole("button", { name: "Postar" }).click();

  await expect(page.getByRole("main").getByText("Post publicado com sucesso.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Novo post E2E" })).toBeVisible();
});

test("edita e deleta um post do proprio usuario", async ({ page }) => {
  await openTimelineAsAuthenticated(page);

  const postCard = page.locator("article").filter({ has: page.getByRole("heading", { name: "Meu post inicial" }) }).first();
  await postCard.getByRole("button", { name: "Editar" }).click();
  const editFormCard = page.locator("article").filter({ hasText: "SalvarCancelar" }).first();

  await editFormCard.locator('input[name="title"]').fill("Meu post atualizado");
  await editFormCard.locator('textarea[name="content"]').fill("Conteudo atualizado por teste e2e.");
  await editFormCard.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("main").getByText("Post atualizado com sucesso.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Meu post atualizado" })).toBeVisible();

  const updatedCard = page.locator("article").filter({ has: page.getByRole("heading", { name: "Meu post atualizado" }) }).first();
  await updatedCard.getByRole("button", { name: "Deletar" }).click();

  await expect(page.getByRole("main").getByText("Post deletado com sucesso.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Meu post atualizado" })).toHaveCount(0);
});

test("busca posts e alterna curtida", async ({ page }) => {
  await openTimelineAsAuthenticated(page);

  const communityCard = page.locator("article").filter({ has: page.getByRole("heading", { name: "Post da comunidade" }) }).first();
  const likeButton = communityCard.getByRole("button", { name: "Curtir post" });

  await likeButton.click();
  await expect(communityCard.getByRole("button", { name: "Descurtir post" })).toBeVisible();

  await page.getByPlaceholder("Buscar por titulo ou tema").fill("frontend");

  await expect(page.getByRole("heading", { name: "Post da comunidade" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Meu post inicial" })).toHaveCount(0);
});
