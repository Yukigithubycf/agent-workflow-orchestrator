import { expect, test } from "@playwright/test";

import { mockLangGraphAPI } from "./utils/mock-api";

test.describe("Application entry", () => {
  test("opens the new chat workspace directly", async ({ page }) => {
    mockLangGraphAPI(page);

    await page.goto("/");

    await page.waitForURL("**/workspace/chats/new");
    await expect(page).toHaveURL(/\/workspace\/chats\/new/);
    await expect(page.getByText("AstraFlow", { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder(/how can i assist you/i)).toBeVisible();
  });
});
