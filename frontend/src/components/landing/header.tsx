import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import { BrandLockup } from "@/components/brand";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/core/i18n/locale";
import { getI18n } from "@/core/i18n/server";
import { cn } from "@/lib/utils";

export type HeaderProps = {
  className?: string;
  homeURL?: string;
  locale?: Locale;
};

export async function Header({ className, homeURL, locale }: HeaderProps) {
  const { locale: resolvedLocale, t } = await getI18n(locale);
  const lang = resolvedLocale.substring(0, 2);
  return (
    <header
      className={cn(
        "bg-background/95 fixed top-0 right-0 left-0 z-20 mx-auto flex h-16 items-center justify-between border-b px-4 backdrop-blur-sm md:px-6",
        className,
      )}
    >
      <Link
        href={homeURL ?? "/"}
        className="transition-opacity hover:opacity-80"
      >
        <BrandLockup />
      </Link>
      <nav className="ml-auto flex items-center gap-4 text-sm font-medium sm:gap-6">
        <Link
          href={`/${lang}/docs`}
          className="text-muted-foreground hover:text-foreground hidden transition-colors sm:block"
        >
          {t.home.docs}
        </Link>
        <Link
          href="/blog/posts"
          className="text-muted-foreground hover:text-foreground hidden transition-colors sm:block"
        >
          {t.home.blog}
        </Link>
      </nav>
      <div className="ml-4">
        <Button variant="outline" size="sm" asChild className="relative">
          <a
            href="https://github.com/Yukigithubycf/AstraFlow"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubLogoIcon className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </Button>
      </div>
    </header>
  );
}
