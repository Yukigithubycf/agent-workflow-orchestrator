import { afterEach, describe, expect, it } from "@rstest/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { SubtaskGalaxy } from "@/components/workspace/messages/subtask-galaxy";
import { I18nContext } from "@/core/i18n/context";
import { SubtaskContext } from "@/core/tasks/context";
import type { Subtask } from "@/core/tasks/types";

function task(id: string, status: Subtask["status"] = "in_progress"): Subtask {
  return {
    id,
    status,
    subagent_type: "general-purpose",
    description: `Task ${id}`,
    prompt: `Prompt for ${id}`,
    ...(status === "completed" ? { result: `Result for ${id}` } : {}),
    ...(status === "failed" ? { error: `Failure for ${id}` } : {}),
  };
}

function renderGalaxy(tasks: Subtask[], isLoading = true) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(["models"], {
    models: [],
    token_usage: { enabled: false },
  });

  const galaxyTree = (nextTasks: Subtask[], nextIsLoading: boolean) => {
    const taskMap = Object.fromEntries(
      nextTasks.map((item) => [item.id, item]),
    );
    return (
      <QueryClientProvider client={queryClient}>
        <I18nContext.Provider
          value={{ locale: "en-US", setLocale: () => undefined }}
        >
          <SubtaskContext.Provider
            value={{
              tasks: taskMap,
              tasksRef: { current: taskMap },
              setTasks: () => undefined,
            }}
          >
            <SubtaskGalaxy
              taskIds={nextTasks.map(({ id }) => id)}
              isLoading={nextIsLoading}
            />
          </SubtaskContext.Provider>
        </I18nContext.Provider>
      </QueryClientProvider>
    );
  };
  const view = render(galaxyTree(tasks, isLoading));
  return {
    ...view,
    rerenderGalaxy(nextTasks: Subtask[], nextIsLoading = true) {
      view.rerender(galaxyTree(nextTasks, nextIsLoading));
    },
  };
}

afterEach(cleanup);

describe("SubtaskGalaxy", () => {
  it("renders the lead agent and every orbiting subtask", () => {
    renderGalaxy([task("one"), task("two"), task("three")]);

    expect(screen.getAllByText("Lead agent")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /Task one/ })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /Task two/ })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /Task three/ })).toHaveLength(
      2,
    );
    expect(screen.getAllByText("3 subagents working in parallel")).toHaveLength(
      2,
    );
  });

  it("reports merged and failed task counts without treating failures as results", () => {
    renderGalaxy([task("one", "completed"), task("two", "failed")]);

    expect(screen.getAllByText("1/2 results merged · 1 failed")).toHaveLength(
      2,
    );
  });

  it("opens the existing task detail timeline in a right-side dialog", () => {
    renderGalaxy([task("one", "completed")], false);

    fireEvent.click(screen.getAllByRole("button", { name: /Task one/ })[0]!);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Prompt for one")).toBeTruthy();
    expect(screen.getByText("Result for one")).toBeTruthy();
  });

  it("sends a result toward the lead agent on a live completion transition", async () => {
    const view = renderGalaxy([task("one")]);

    expect(screen.queryByTestId("subtask-result-arrival")).toBeNull();
    view.rerenderGalaxy([task("one", "completed")]);

    expect(await screen.findByTestId("subtask-result-arrival")).toBeTruthy();
  });
});
