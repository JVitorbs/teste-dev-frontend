import { expect, test } from "@playwright/test";
import { setupMockApi } from "./helpers/mockApi";

test("redireciona rota protegida para /auth quando nao autenticado", async ({ page }) => {
  await setupMockApi(page);

  await page.goto("/timeline");

  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("registra conta e realiza login com sucesso", async ({ page }) => {
  await setupMockApi(page);

  await page.goto("/auth");

  await page.getByRole("tab", { name: "Registrar" }).click();
  const registerTab = page.locator('[role="tabpanel"][data-state="active"]');
  await registerTab.getByPlaceholder("Nome").fill("Joao E2E");
  await registerTab.getByPlaceholder("E-mail").fill("joao@teste.com");
  await registerTab.getByPlaceholder("Senha").fill("senha123");
  await registerTab.getByRole("button", { name: "Criar conta" }).click();

  await expect(page.getByText("Conta criada com sucesso. Agora faca login.")).toBeVisible();

  const loginTab = page.locator('[role="tabpanel"][data-state="active"]');
  await loginTab.getByPlaceholder("E-mail").fill("joao@teste.com");
  await loginTab.getByPlaceholder("Senha").fill("senha123");
  await loginTab.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/timeline$/);
  await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Novo post" })).toBeVisible();
});

test("exibe erro quando login falha", async ({ page }) => {
  await setupMockApi(page, { loginShouldFail: true });

  await page.goto("/auth");

  const loginTab = page.locator('[role="tabpanel"][data-state="active"]');
  await loginTab.getByPlaceholder("E-mail").fill("joao@teste.com");
  await loginTab.getByPlaceholder("Senha").fill("senha-invalida");
  await loginTab.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("Credenciais invalidas.")).toBeVisible();
  await expect(page).toHaveURL(/\/auth$/);
});
