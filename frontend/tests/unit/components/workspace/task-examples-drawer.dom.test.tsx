import { afterEach, beforeEach, describe, expect, it, rs } from "@rstest/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import {
  TaskExamplesDrawer,
  type TaskExample,
} from "@/components/workspace/task-examples-drawer";

rs.mock("@/core/i18n/hooks", () => ({
  useI18n: () => ({
    locale: "en-US",
    t: {
      inputBox: {
        reasoningMode: "Reasoning",
        proMode: "Pro",
        ultraMode: "Ultra",
      },
      taskExamples: {
        triggerLabel: "Task examples",
        title: "Task examples",
        description: "Choose an example.",
        onboardingTitle: "Not sure where to start?",
        onboardingDescription: "Try a ready-made request.",
        onboardingAction: "Browse examples",
        dismissOnboarding: "Dismiss task examples tip",
        exampleLabel: "Example {number}",
        useExample: "Use example: {prompt}",
        worldModelsPrompt: "Research world models.",
        aiNewsPrompt: "Summarize five AI news stories.",
        codingAgentsPrompt: "Compare coding agents.",
      },
    },
    changeLocale: rs.fn(),
  }),
}));

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  rs.restoreAllMocks();
  cleanup();
});

describe("TaskExamplesDrawer", () => {
  it("records the first-visit prompt only after the user dismisses it", () => {
    const { unmount } = render(<TaskExamplesDrawer onSelect={rs.fn()} />);

    expect(screen.getByRole("status").textContent).toContain(
      "Not sure where to start?",
    );
    expect(
      window.localStorage.getItem("deerflow.task-examples-onboarding.seen.v2"),
    ).toBeNull();

    unmount();
    render(<TaskExamplesDrawer onSelect={rs.fn()} />);
    expect(screen.getByRole("status")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss task examples tip" }),
    );
    expect(
      window.localStorage.getItem("deerflow.task-examples-onboarding.seen.v2"),
    ).toBe("true");

    cleanup();
    render(<TaskExamplesDrawer onSelect={rs.fn()} />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("opens the drawer and returns the selected prompt with its mode", () => {
    const onSelect = rs.fn<(example: TaskExample) => void>();
    window.localStorage.setItem(
      "deerflow.task-examples-onboarding.seen.v2",
      "true",
    );
    render(<TaskExamplesDrawer onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "Task examples" }));
    expect(screen.getByRole("heading", { name: "Task examples" })).toBeTruthy();
    expect(screen.getByText("Reasoning")).toBeTruthy();
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.getByText("Ultra")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Use example: Compare coding agents.",
      }),
    );

    expect(onSelect).toHaveBeenCalledWith({
      id: "coding-agents",
      mode: "ultra",
      prompt: "Compare coding agents.",
    });
  });
});
