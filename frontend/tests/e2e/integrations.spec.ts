import { expect, test } from "@playwright/test";

import { mockLangGraphAPI } from "./utils/mock-api";

test.describe("Hidden settings sections", () => {
  test("hides Notification, Channels, Integrations, and About", async ({
    page,
  }) => {
    mockLangGraphAPI(page);
    await page.goto("/workspace/chats/new");

    const sidebar = page.locator("[data-sidebar='sidebar']");
    await sidebar.getByRole("button", { name: "Settings" }).click();

    const dialog = page.getByRole("dialog", { name: "Settings" });
    await expect(dialog).toBeVisible();
    for (const section of [
      "Notification",
      "Channels",
      "Integrations",
      "About",
    ]) {
      await expect(dialog.getByRole("button", { name: section })).toHaveCount(
        0,
      );
    }
  });

  test("does not open a hidden section from a query-string deep link", async ({
    page,
  }) => {
    mockLangGraphAPI(page);
    await page.goto("/workspace/chats/new?settings=integrations");
    await expect(page.getByRole("dialog", { name: "Settings" })).toHaveCount(0);
  });
});
