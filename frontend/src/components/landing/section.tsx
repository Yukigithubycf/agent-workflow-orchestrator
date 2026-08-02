import { cn } from "@/lib/utils";

export function Section({
  className,
  title,
  subtitle,
  children,
}: {
  className?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-col border-b px-4 py-20 sm:px-8",
        className,
      )}
    >
      <header className="flex flex-col items-center justify-between">
        <div className="mb-3 text-center text-3xl font-semibold sm:text-4xl">
          {title}
        </div>
        {subtitle && (
          <div className="text-muted-foreground max-w-3xl text-center text-base leading-7 sm:text-lg">
            {subtitle}
          </div>
        )}
      </header>
      <main className="mt-4">{children}</main>
    </section>
  );
}
