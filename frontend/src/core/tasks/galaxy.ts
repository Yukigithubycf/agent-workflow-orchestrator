import type { Subtask } from "./types";

export type SubtaskGalaxyPhase =
  | "dispatch"
  | "parallel"
  | "converging"
  | "completed";

export interface SubtaskGalaxyState {
  phase: SubtaskGalaxyPhase;
  total: number;
  inProgress: number;
  completed: number;
  failed: number;
  /** Successful results available to the lead agent. */
  merged: number;
}

export interface GalaxyOrbitPosition {
  /** Horizontal position as a percentage of the galaxy stage. */
  x: number;
  /** Vertical position as a percentage of the galaxy stage. */
  y: number;
  /** Inner ring is 1; outer ring is 2. */
  ring: 1 | 2;
  angle: number;
}

export function deriveSubtaskGalaxyState(
  tasks: readonly Subtask[],
  isRunLoading: boolean,
): SubtaskGalaxyState {
  let inProgress = 0;
  let completed = 0;
  let failed = 0;

  for (const task of tasks) {
    if (task.status === "in_progress") {
      inProgress += 1;
    } else if (task.status === "completed") {
      completed += 1;
    } else {
      failed += 1;
    }
  }

  const total = tasks.length;
  const phase: SubtaskGalaxyPhase =
    total === 0
      ? "dispatch"
      : inProgress > 0
        ? "parallel"
        : isRunLoading
          ? "converging"
          : "completed";

  return {
    phase,
    total,
    inProgress,
    completed,
    failed,
    merged: completed,
  };
}

function positionsForRing(count: number, ring: 1 | 2): GalaxyOrbitPosition[] {
  if (count <= 0) {
    return [];
  }

  const radiusX = ring === 1 ? 34 : 43;
  // The inner orbit needs enough vertical clearance for a 110px task card and
  // the 160px lead core inside the 420px desktop stage. A 36% radius leaves a
  // visible gap instead of letting the top card overlap the core.
  const radiusY = ring === 1 ? 36 : 40;
  const startAngle = count === 2 ? 180 : ring === 1 ? -90 : -67.5;

  return Array.from({ length: count }, (_, localIndex) => {
    const angle = startAngle + (360 / count) * localIndex;
    const radians = (angle * Math.PI) / 180;
    return {
      x: Number((50 + Math.cos(radians) * radiusX).toFixed(3)),
      y: Number((50 + Math.sin(radians) * radiusY).toFixed(3)),
      ring,
      angle,
    };
  });
}

/**
 * Return stable, percentage-based positions for the task nodes. Up to six
 * tasks use one orbit; larger groups split evenly across two orbits so the
 * lead agent remains readable at the center.
 */
export function getGalaxyOrbitPositions(count: number): GalaxyOrbitPosition[] {
  const safeCount = Math.max(0, Math.floor(count));
  if (safeCount === 0) {
    return [];
  }
  if (safeCount <= 6) {
    return positionsForRing(safeCount, 1);
  }

  const outerCount = Math.ceil(safeCount / 2);
  const innerCount = safeCount - outerCount;
  return [
    ...positionsForRing(outerCount, 2),
    ...positionsForRing(innerCount, 1),
  ];
}
