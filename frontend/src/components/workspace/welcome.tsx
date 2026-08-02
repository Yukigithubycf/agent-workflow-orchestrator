"use client";

import { WandSparklesIcon, WorkflowIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useI18n } from "@/core/i18n/hooks";
import { cn } from "@/lib/utils";

function WelcomeDescription({ children }: { children: string }) {
  return (
    <p className="max-w-full text-wrap break-words whitespace-pre-line">
      {children}
    </p>
  );
}

export function Welcome({
  className,
  mode,
}: {
  className?: string;
  mode?: "ultra" | "pro" | "thinking" | "flash";
}) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const isSkillMode = searchParams.get("mode") === "skill";
  const WelcomeIcon = isSkillMode ? WandSparklesIcon : WorkflowIcon;
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-full flex-col items-center justify-center gap-3 px-4 py-5 text-center sm:px-8",
        className,
      )}
    >
      <div className="border-border/70 bg-card/70 text-muted-foreground inline-flex h-7 items-center gap-2 rounded-md border px-2.5 text-[10px] font-semibold uppercase shadow-sm">
        <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-emerald-500)_16%,transparent)]" />
        AstraFlow / Orchestration
      </div>
      <div className="flex max-w-full items-center justify-center gap-3">
        <span
          className={cn(
            "border-border/70 bg-card flex size-10 shrink-0 items-center justify-center rounded-md border shadow-sm",
            mode === "ultra" ? "text-amber-500" : "text-primary",
          )}
        >
          <WelcomeIcon className="size-5" />
        </span>
        <h1 className="max-w-full text-2xl font-semibold text-balance sm:text-3xl">
          {isSkillMode ? t.welcome.createYourOwnSkill : t.welcome.greeting}
        </h1>
      </div>
      {isSkillMode ? (
        <div className="text-muted-foreground max-w-xl text-sm leading-6">
          <WelcomeDescription>
            {t.welcome.createYourOwnSkillDescription}
          </WelcomeDescription>
        </div>
      ) : (
        <div className="text-muted-foreground max-w-xl text-sm leading-6">
          <WelcomeDescription>{t.welcome.description}</WelcomeDescription>
        </div>
      )}
    </div>
  );
}
