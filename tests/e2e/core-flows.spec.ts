import { test, expect } from "@playwright/test";

test.describe("Boardscape Core E2E Flows", () => {
  test("corporate homepage renders agency positioning without pill badge clutter", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /We make you impossible to ignore/i,
      })
    ).toBeVisible();
  });

  test("Atlas explorer loads filter controls and empty/inventory state", async ({ page }) => {
    await page.goto("/atlas");
    await expect(page.getByLabel("Search inventory")).toBeVisible();
    await expect(page.getByLabel("Filter by Abuja district")).toBeVisible();
  });

  test("Field Survey PWA renders mobile capture form", async ({ page }) => {
    await page.goto("/field/surveys/new");
    await expect(page.getByRole("heading", { name: /New Billboard Survey/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Save Offline Draft/i })).toBeVisible();
  });
});
