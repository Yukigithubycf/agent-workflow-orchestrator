"use client";

import {
  BookOpenTextIcon,
  GraduationCapIcon,
  LightbulbIcon,
  RocketIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useI18n } from "@/core/i18n/hooks";
import { safeLocalStorage } from "@/core/settings/local";
import { cn } from "@/lib/utils";

import { Tooltip } from "./tooltip";

export type TaskExampleMode = "thinking" | "pro" | "ultra";

export type TaskExample = {
  id: "world-models" | "ai-news" | "coding-agents";
  mode: TaskExampleMode;
  prompt: string;
};

const TASK_EXAMPLES_ONBOARDING_KEY =
  "deerflow.task-examples-onboarding.seen.v2";

const MODE_PRESENTATION: Record<
  TaskExampleMode,
  { icon: LucideIcon; className: string }
> = {
  thinking: {
    icon: LightbulbIcon,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  pro: {
    icon: GraduationCapIcon,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  ultra: {
    icon: RocketIcon,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

function modeLabel(
  mode: TaskExampleMode,
  inputBox: ReturnType<typeof useI18n>["t"]["inputBox"],
) {
  if (mode === "thinking") return inputBox.reasoningMode;
  if (mode === "pro") return inputBox.proMode;
  return inputBox.ultraMode;
}

export function TaskExamplesDrawer({
  disabled = false,
  onSelect,
}: {
  disabled?: boolean;
  onSelect: (example: TaskExample) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const examples: TaskExample[] = [
    {
      id: "world-models",
      mode: "thinking",
      prompt: t.taskExamples.worldModelsPrompt,
    },
    {
      id: "ai-news",
      mode: "pro",
      prompt: t.taskExamples.aiNewsPrompt,
    },
    {
      id: "coding-agents",
      mode: "ultra",
      prompt: t.taskExamples.codingAgentsPrompt,
    },
  ];

  useEffect(() => {
    if (disabled) {
      return;
    }
    if (safeLocalStorage.getItem(TASK_EXAMPLES_ONBOARDING_KEY) === "true") {
      return;
    }
    setShowOnboarding(true);
  }, [disabled]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    safeLocalStorage.setItem(TASK_EXAMPLES_ONBOARDING_KEY, "true");
  };

  const openDrawer = () => {
    dismissOnboarding();
    setOpen(true);
  };

  return (
    <>
      <div className="relative">
        <Tooltip content={t.taskExamples.triggerLabel}>
          <Button
            aria-label={t.taskExamples.triggerLabel}
            className="text-muted-foreground hover:text-foreground"
            data-testid="task-examples-trigger"
            disabled={disabled}
            size="icon"
            type="button"
            variant={open ? "secondary" : "ghost"}
            onClick={openDrawer}
          >
            <BookOpenTextIcon />
          </Button>
        </Tooltip>

        {showOnboarding && !disabled && (
          <div
            className="border-border bg-popover text-popover-foreground absolute top-11 right-0 z-50 w-72 rounded-xl border p-3 shadow-xl"
            data-testid="task-examples-onboarding"
            role="status"
          >
            <span className="border-b-popover absolute -top-2 right-3 size-0 border-x-8 border-b-8 border-x-transparent" />
            <button
              aria-label={t.taskExamples.dismissOnboarding}
              className="text-muted-foreground hover:text-foreground absolute top-2 right-2 rounded-sm p-1"
              type="button"
              onClick={dismissOnboarding}
            >
              <XIcon className="size-3.5" />
            </button>
            <div className="pr-6 text-sm font-medium">
              {t.taskExamples.onboardingTitle}
            </div>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              {t.taskExamples.onboardingDescription}
            </p>
            <Button className="mt-3 w-full" size="sm" onClick={openDrawer}>
              {t.taskExamples.onboardingAction}
            </Button>
          </div>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          className="w-[calc(100vw-1rem)] gap-0 p-0 sm:max-w-md"
          side="right"
        >
          <SheetHeader className="border-border border-b px-5 py-5 pr-12">
            <SheetTitle className="flex items-center gap-2">
              <BookOpenTextIcon className="text-primary size-5" />
              {t.taskExamples.title}
            </SheetTitle>
            <SheetDescription>{t.taskExamples.description}</SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-3">
              {examples.map((example, index) => {
                const presentation = MODE_PRESENTATION[example.mode];
                const ModeIcon = presentation.icon;
                return (
                  <button
                    key={example.id}
                    aria-label={t.taskExamples.useExample.replace(
                      "{prompt}",
                      example.prompt,
                    )}
                    className="border-border/70 bg-card hover:border-primary/40 hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-ring/50 group rounded-xl border p-4 text-left shadow-xs transition-all focus-visible:ring-[3px] focus-visible:outline-none"
                    data-testid={`task-example-${example.id}`}
                    type="button"
                    onClick={() => {
                      onSelect(example);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          presentation.className,
                        )}
                      >
                        <ModeIcon className="size-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground text-xs font-medium">
                            {t.taskExamples.exampleLabel.replace(
                              "{number}",
                              String(index + 1),
                            )}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-medium",
                              presentation.className,
                            )}
                          >
                            {modeLabel(example.mode, t.inputBox)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 font-medium">
                          {example.prompt}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
