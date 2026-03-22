import { expect, test } from "@playwright/test";
import { seedAuthenticatedSession, setupMockApi } from "./helpers/mockApi";

test.describe("menu mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("abre menu lateral e realiza logout", async ({ page }) => {
    await seedAuthenticatedSession(page);
    await setupMockApi(page);

    await page.goto("/timeline");

    await page.getByRole("button", { name: "Abrir menu" }).click();
    await expect(page.getByRole("button", { name: "Fechar menu" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();

    await page.getByRole("button", { name: "Sair" }).click();

    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  });
});
