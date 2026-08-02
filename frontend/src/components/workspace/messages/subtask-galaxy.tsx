"use client";

import {
  BotIcon,
  CheckCircleIcon,
  Loader2Icon,
  OrbitIcon,
  SparklesIcon,
  XCircleIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useI18n } from "@/core/i18n/hooks";
import { hasToolCalls } from "@/core/messages/utils";
import { useModels } from "@/core/models/hooks";
import { useSubtaskContext } from "@/core/tasks/context";
import {
  deriveSubtaskGalaxyState,
  getGalaxyOrbitPositions,
  type GalaxyOrbitPosition,
} from "@/core/tasks/galaxy";
import {
  formatSubtaskTokenUsage,
  resolveSubtaskModelLabel,
} from "@/core/tasks/presentation";
import type { Subtask } from "@/core/tasks/types";
import { explainLastToolCall } from "@/core/tools/utils";
import { cn } from "@/lib/utils";

import { SubtaskCard } from "./subtask-card";

interface ResultArrival {
  key: number;
  position: GalaxyOrbitPosition;
}

export function SubtaskGalaxy({
  taskIds,
  threadId,
  runId,
  isLoading,
}: {
  taskIds: string[];
  threadId?: string;
  runId?: string;
  isLoading: boolean;
}) {
  const { t } = useI18n();
  const { tasks: taskMap } = useSubtaskContext();
  const { models, tokenUsageEnabled } = useModels();
  const shouldReduceMotion = useReducedMotion();
  const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const [arrivals, setArrivals] = useState<ResultArrival[]>([]);
  const previousStatusesRef = useRef<Record<string, Subtask["status"]>>({});
  const hasHydratedStatusesRef = useRef(false);
  const arrivalKeyRef = useRef(0);

  const tasks = taskIds
    .map((taskId) => taskMap[taskId])
    .filter((task): task is Subtask => task !== undefined);
  const state = deriveSubtaskGalaxyState(tasks, isLoading);
  const positions = useMemo(
    () => getGalaxyOrbitPositions(taskIds.length),
    [taskIds.length],
  );

  useEffect(() => {
    const currentStatuses = Object.fromEntries(
      tasks.map((task) => [task.id, task.status]),
    );
    if (!hasHydratedStatusesRef.current) {
      hasHydratedStatusesRef.current = true;
      previousStatusesRef.current = currentStatuses;
      return;
    }

    const completedArrivals = tasks.flatMap((task) => {
      const previousStatus = previousStatusesRef.current[task.id];
      if (previousStatus !== "in_progress" || task.status !== "completed") {
        return [];
      }
      const taskIndex = taskIds.indexOf(task.id);
      const position = positions[taskIndex];
      if (!position) {
        return [];
      }
      arrivalKeyRef.current += 1;
      return [{ key: arrivalKeyRef.current, position }];
    });

    if (completedArrivals.length > 0) {
      setArrivals((current) => [...current, ...completedArrivals]);
    }
    previousStatusesRef.current = currentStatuses;
  }, [positions, taskIds, tasks]);

  useEffect(() => {
    if (selectedTaskId && !taskMap[selectedTaskId]) {
      setSelectedTaskId(undefined);
    }
  }, [selectedTaskId, taskMap]);

  const phaseLabel =
    state.phase === "dispatch"
      ? t.subtasks.galaxy.dispatching
      : state.phase === "parallel"
        ? t.subtasks.galaxy.parallel(state.total)
        : state.phase === "converging"
          ? t.subtasks.galaxy.converging
          : t.subtasks.galaxy.completed;
  const progressLabel = t.subtasks.galaxy.mergedProgress(
    state.merged,
    state.total,
    state.failed,
  );
  const manyTasks = taskIds.length > 6;
  const selectedTask = selectedTaskId ? taskMap[selectedTaskId] : undefined;
  const selectedTaskModelLabel = selectedTask
    ? resolveSubtaskModelLabel(selectedTask.modelName, models)
    : undefined;
  const selectedTaskTokenLabel =
    selectedTask && tokenUsageEnabled
      ? formatSubtaskTokenUsage(selectedTask.usage)
      : undefined;

  return (
    <div className="w-full">
      <section
        className="bg-background/95 relative overflow-hidden rounded-2xl border shadow-sm"
        aria-label={t.subtasks.executing(state.total)}
      >
        <header className="bg-background/90 relative z-30 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <OrbitIcon className="text-primary size-4 shrink-0" />
            <span className="font-medium">
              {t.subtasks.executing(state.total)}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            {state.inProgress > 0 && (
              <Loader2Icon className="size-3 animate-spin motion-reduce:animate-none" />
            )}
            <span>{phaseLabel}</span>
          </div>
        </header>

        <div
          className={cn(
            "relative hidden overflow-hidden sm:block",
            manyTasks ? "h-[520px]" : "h-[420px]",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle at 14% 22%, var(--border) 0 1px, transparent 1.5px), radial-gradient(circle at 84% 18%, var(--border) 0 1px, transparent 1.5px), radial-gradient(circle at 20% 78%, var(--border) 0 1px, transparent 1.5px), radial-gradient(circle at 76% 76%, var(--border) 0 1px, transparent 1.5px)",
            }}
          />
          <svg
            className="text-border pointer-events-none absolute inset-0 size-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <motion.ellipse
              cx="50"
              cy="50"
              rx="34"
              ry="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.35"
              strokeDasharray="1.6 2.4"
              vectorEffect="non-scaling-stroke"
              animate={
                shouldReduceMotion ? undefined : { strokeDashoffset: [0, -10] }
              }
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            {manyTasks && (
              <motion.ellipse
                cx="50"
                cy="50"
                rx="43"
                ry="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.35"
                strokeDasharray="1.2 2.8"
                vectorEffect="non-scaling-stroke"
                animate={
                  shouldReduceMotion ? undefined : { strokeDashoffset: [0, 12] }
                }
                transition={{
                  duration: 14,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}
            {positions.map((position, index) => (
              <motion.line
                key={taskIds[index]}
                x1="50"
                y1="50"
                x2={position.x}
                y2={position.y}
                stroke="currentColor"
                strokeWidth="0.22"
                strokeDasharray="1.2 1.5"
                vectorEffect="non-scaling-stroke"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { strokeDashoffset: [0, -5.4] }
                }
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 0.18,
                }}
              />
            ))}
          </svg>

          <LeadAgentCore
            phaseLabel={phaseLabel}
            progressLabel={progressLabel}
            isActive={isLoading}
            reduceMotion={Boolean(shouldReduceMotion)}
          />

          {tasks.map((task, index) => {
            const position = positions[index];
            if (!position) {
              return null;
            }
            return (
              <div
                key={task.id}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              >
                <GalaxyTaskNode
                  task={task}
                  selected={selectedTaskId === task.id}
                  compact={manyTasks}
                  modelLabel={resolveSubtaskModelLabel(task.modelName, models)}
                  tokenLabel={
                    tokenUsageEnabled
                      ? formatSubtaskTokenUsage(task.usage)
                      : undefined
                  }
                  reduceMotion={Boolean(shouldReduceMotion)}
                  animateActivity
                  motionIndex={index}
                  onSelect={() => setSelectedTaskId(task.id)}
                />
              </div>
            );
          })}

          <AnimatePresence>
            {arrivals.map((arrival) => (
              <motion.span
                key={arrival.key}
                data-testid="subtask-result-arrival"
                className="bg-primary pointer-events-none absolute z-40 size-2 rounded-full shadow-lg"
                initial={{
                  left: `${arrival.position.x}%`,
                  top: `${arrival.position.y}%`,
                  opacity: shouldReduceMotion ? 0 : 1,
                  scale: 1,
                }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : {
                        left: "50%",
                        top: "50%",
                        opacity: [0, 1, 1, 0],
                        scale: [1, 0.9, 0.6, 0.1],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.8, ease: "easeInOut" }
                }
                onAnimationComplete={() =>
                  setArrivals((current) =>
                    current.filter(({ key }) => key !== arrival.key),
                  )
                }
              />
            ))}
          </AnimatePresence>

          <p className="text-muted-foreground absolute inset-x-4 bottom-3 text-center text-xs">
            {selectedTaskId ? progressLabel : t.subtasks.galaxy.selectTask}
          </p>
        </div>

        <div className="relative grid gap-3 p-4 sm:hidden">
          <div className="border-primary/25 from-primary/10 to-background flex items-center gap-3 rounded-xl border bg-gradient-to-r p-3">
            <span className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-full">
              <SparklesIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium">
                {t.subtasks.galaxy.leadAgent}
              </div>
              <div className="text-muted-foreground truncate text-xs">
                {progressLabel}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tasks.map((task) => (
              <GalaxyTaskNode
                key={task.id}
                task={task}
                selected={selectedTaskId === task.id}
                compact
                modelLabel={resolveSubtaskModelLabel(task.modelName, models)}
                tokenLabel={
                  tokenUsageEnabled
                    ? formatSubtaskTokenUsage(task.usage)
                    : undefined
                }
                reduceMotion={Boolean(shouldReduceMotion)}
                animateActivity={false}
                motionIndex={0}
                onSelect={() => setSelectedTaskId(task.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <Sheet
        open={selectedTask !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTaskId(undefined);
          }
        }}
      >
        {selectedTask && (
          <SheetContent
            className="w-[min(92vw,34rem)] max-w-none gap-0 p-0 sm:max-w-[34rem]"
            side="right"
          >
            <SheetHeader className="shrink-0 border-b pr-12">
              <SheetTitle className="line-clamp-2 text-base">
                {selectedTask.description}
              </SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-1 text-xs">
                <span>{t.subtasks[selectedTask.status]}</span>
                {selectedTaskModelLabel && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{selectedTaskModelLabel}</span>
                  </>
                )}
                {selectedTaskTokenLabel && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{selectedTaskTokenLabel}</span>
                  </>
                )}
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <SubtaskCard
                taskId={selectedTask.id}
                threadId={threadId}
                runId={runId}
                isLoading={isLoading && selectedTask.status === "in_progress"}
                defaultOpen
              />
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}

function LeadAgentCore({
  phaseLabel,
  progressLabel,
  isActive,
  reduceMotion,
}: {
  phaseLabel: string;
  progressLabel: string;
  isActive: boolean;
  reduceMotion: boolean;
}) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "border-primary/40 from-primary/15 via-background to-background absolute top-1/2 left-1/2 z-10 flex size-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border bg-radial text-center shadow-lg",
        isActive && "ring-primary/5 ring-8",
      )}
      role="status"
      aria-live="polite"
    >
      {isActive && (
        <motion.span
          className="border-primary/25 pointer-events-none absolute -inset-3 rounded-full border"
          aria-hidden="true"
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 0.35, scale: 1 }
              : { opacity: [0.4, 0], scale: [1, 1.12] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 2.6, repeat: Infinity, ease: "easeOut" }
          }
        />
      )}
      <span className="bg-primary/10 text-primary mb-2 grid size-9 place-items-center rounded-full">
        <SparklesIcon className="size-4" />
      </span>
      <strong className="text-sm font-medium">
        {t.subtasks.galaxy.leadAgent}
      </strong>
      <span className="text-muted-foreground mt-1 max-w-32 text-xs">
        {phaseLabel}
      </span>
      <span className="text-muted-foreground mt-1 max-w-32 text-[11px]">
        {progressLabel}
      </span>
    </div>
  );
}

function GalaxyTaskNode({
  task,
  selected,
  compact,
  modelLabel,
  tokenLabel,
  reduceMotion,
  animateActivity,
  motionIndex,
  onSelect,
}: {
  task: Subtask;
  selected: boolean;
  compact: boolean;
  modelLabel?: string;
  tokenLabel?: string;
  reduceMotion: boolean;
  animateActivity: boolean;
  motionIndex: number;
  onSelect: () => void;
}) {
  const { t } = useI18n();
  const statusLabel = t.subtasks[task.status];
  const activityLabel =
    task.status === "in_progress" &&
    task.latestMessage &&
    hasToolCalls(task.latestMessage)
      ? explainLastToolCall(task.latestMessage, t)
      : statusLabel;
  const statusIcon =
    task.status === "completed" ? (
      <CheckCircleIcon className="size-3.5" />
    ) : task.status === "failed" ? (
      <XCircleIcon className="size-3.5" />
    ) : (
      <Loader2Icon className="size-3.5 animate-spin motion-reduce:animate-none" />
    );

  return (
    <motion.button
      type="button"
      className={cn(
        "bg-background/95 hover:border-primary/50 focus-visible:ring-ring group relative w-full rounded-xl border p-2.5 text-left shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
        compact ? "sm:w-36" : "sm:w-44",
        selected && "border-primary ring-primary/20 ring-2",
        task.status === "completed" && "border-emerald-500/35",
        task.status === "failed" && "border-red-500/50",
      )}
      initial={false}
      animate={
        animateActivity && task.status === "in_progress" && !reduceMotion
          ? { opacity: 1, scale: 1, y: [0, -3, 0, 2, 0] }
          : {
              opacity: task.status === "completed" ? 0.78 : 1,
              scale: task.status === "completed" ? 0.96 : 1,
              y: 0,
            }
      }
      transition={
        animateActivity && task.status === "in_progress" && !reduceMotion
          ? {
              duration: 4.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (motionIndex % 5) * 0.24,
            }
          : { duration: reduceMotion ? 0 : 0.25 }
      }
      aria-label={`${task.description} · ${statusLabel}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="flex min-w-0 items-start gap-2">
        <span
          className={cn(
            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full",
            task.status === "failed"
              ? "bg-red-500/10 text-red-500"
              : task.status === "completed"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-primary/10 text-primary",
          )}
        >
          <BotIcon className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-xs font-medium">
            {task.description}
          </span>
          <span
            className={cn(
              "text-muted-foreground mt-1 flex items-center gap-1 truncate text-[11px]",
              task.status === "failed" && "text-red-500",
            )}
          >
            {statusIcon}
            <span className="truncate">{activityLabel}</span>
          </span>
        </span>
      </span>
      {(modelLabel !== undefined || tokenLabel !== undefined) && (
        <span className="text-muted-foreground mt-2 flex min-w-0 items-center gap-1 border-t pt-1.5 text-[10px]">
          {modelLabel && <span className="truncate">{modelLabel}</span>}
          {modelLabel && tokenLabel && <span aria-hidden="true">·</span>}
          {tokenLabel && <span className="shrink-0">{tokenLabel}</span>}
        </span>
      )}
    </motion.button>
  );
}
