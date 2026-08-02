import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-md", className)}
      priority
    />
  );
}

export function BrandLockup({
  className,
  markClassName,
  showDescriptor = false,
}: {
  className?: string;
  markClassName?: string;
  showDescriptor?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <BrandMark className={markClassName} />
      <span className="flex min-w-0 flex-col">
        <span className="text-base leading-5 font-semibold">AstraFlow</span>
        {showDescriptor && (
          <span className="text-muted-foreground text-[9px] leading-3 font-semibold uppercase">
            Orchestration OS
          </span>
        )}
      </span>
    </span>
  );
}
