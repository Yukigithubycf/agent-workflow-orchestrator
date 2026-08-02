"use client";

import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "relative flex min-h-[calc(100svh-10rem)] w-full items-center overflow-hidden border-b px-4 pt-20 pb-10 sm:px-8",
        className,
      )}
    >
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <BrandMark className="mb-8 size-20 sm:size-24" size={96} />
        <div className="border-border bg-background mb-5 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
          <SparklesIcon className="size-4" />
          Multi-agent AI workspace
        </div>
        <h1 className="text-5xl font-semibold sm:text-6xl">AstraFlow</h1>
        <p className="text-muted-foreground mt-5 text-lg sm:text-xl">
          Research deeply. Analyze data. Build deliverables.
        </p>
        <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-7 sm:text-lg">
          Plan and execute complex work with tools, skills, memory, sandboxes,
          and coordinated sub-agents.
        </p>
        <Link href="/workspace" className="mt-8">
          <Button size="lg">
            Get Started
            <ArrowRightIcon className="size-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
