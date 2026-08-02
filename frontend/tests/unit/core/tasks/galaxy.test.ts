import { describe, expect, it } from "@rstest/core";

import {
  deriveSubtaskGalaxyState,
  getGalaxyOrbitPositions,
} from "@/core/tasks/galaxy";
import type { Subtask } from "@/core/tasks/types";

function task(id: string, status: Subtask["status"] = "in_progress"): Subtask {
  return {
    id,
    status,
    subagent_type: "general-purpose",
    description: `Task ${id}`,
    prompt: `Run ${id}`,
  };
}

describe("deriveSubtaskGalaxyState", () => {
  it("uses the dispatch phase before tasks are available", () => {
    expect(deriveSubtaskGalaxyState([], true)).toEqual({
      phase: "dispatch",
      total: 0,
      inProgress: 0,
      completed: 0,
      failed: 0,
      merged: 0,
    });
  });

  it("stays parallel while any subtask is running", () => {
    expect(
      deriveSubtaskGalaxyState(
        [task("one", "completed"), task("two", "in_progress")],
        true,
      ),
    ).toEqual({
      phase: "parallel",
      total: 2,
      inProgress: 1,
      completed: 1,
      failed: 0,
      merged: 1,
    });
  });

  it("converges after every subtask ends while the lead agent is still running", () => {
    expect(
      deriveSubtaskGalaxyState(
        [task("one", "completed"), task("two", "failed")],
        true,
      ),
    ).toEqual({
      phase: "converging",
      total: 2,
      inProgress: 0,
      completed: 1,
      failed: 1,
      merged: 1,
    });
  });

  it("completes once the lead-agent run settles", () => {
    const state = deriveSubtaskGalaxyState(
      [task("one", "completed"), task("two", "completed")],
      false,
    );

    expect(state.phase).toBe("completed");
    expect(state.merged).toBe(2);
  });
});

describe("getGalaxyOrbitPositions", () => {
  it("places three agents at distinct positions around the center", () => {
    const positions = getGalaxyOrbitPositions(3);

    expect(positions).toHaveLength(3);
    expect(new Set(positions.map(({ x, y }) => `${x}:${y}`)).size).toBe(3);
    expect(positions.every(({ ring }) => ring === 1)).toBe(true);
    // Keep the top card clear of the 160px lead-agent core in the 420px stage.
    expect(positions[0]?.y).toBeLessThanOrEqual(15);
  });

  it("uses two rings for more than six agents", () => {
    const positions = getGalaxyOrbitPositions(8);

    expect(positions).toHaveLength(8);
    expect(positions.filter(({ ring }) => ring === 1)).toHaveLength(4);
    expect(positions.filter(({ ring }) => ring === 2)).toHaveLength(4);
  });

  it("keeps every position within the rendered stage", () => {
    for (const count of [1, 2, 3, 6, 8, 10]) {
      for (const position of getGalaxyOrbitPositions(count)) {
        expect(position.x).toBeGreaterThanOrEqual(5);
        expect(position.x).toBeLessThanOrEqual(95);
        expect(position.y).toBeGreaterThanOrEqual(8);
        expect(position.y).toBeLessThanOrEqual(92);
      }
    }
  });

  it("returns no positions for an empty task group", () => {
    expect(getGalaxyOrbitPositions(0)).toEqual([]);
  });
});
