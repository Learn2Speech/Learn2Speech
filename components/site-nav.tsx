"use client"; // needs usePathname to mark the page you're on
// Top bar on every main page: logo on the left, page links, theme switch and account menu on the right.
import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "@/app/auth-button";
import Logo, { LogoMark } from "@/components/brand/logo";
import ThemeToggle from "@/components/theme-toggle";
import { SoundToggle } from "@/components/ui-sounds";
import { cn } from "@/lib/utils";

// needsLogin: the page guard sends logged-out visitors to /login, so we don't let Next.js
// pre-load it. A pre-load made while logged out saves the "go to login" answer, and clicking
// the link right after logging in would replay it (until a refresh).
const PAGES = [
  // Practice = Record or Upload; both pages have a switch at the top, so either counts as "on Practice"
  { title: "Practice", href: "/record", matches: ["/record", "/upload"], needsLogin: true },
  { title: "History", href: "/history", matches: ["/history"], needsLogin: true },
  { title: "Tutorial", href: "/demo", matches: ["/demo"], needsLogin: false },
];

// activePath is the page you're on, or null while unknown.
function NavLinks({ activePath }: { activePath: string | null }) {
  return (
    <nav aria-label="Main" className="flex items-center sm:gap-1">
      {PAGES.map((page) => {
        const active = page.matches.some((path) => activePath?.startsWith(path));
        return (
          <Link
            key={page.href}
            href={page.href}
            prefetch={!page.needsLogin}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center rounded-md px-1.5 text-sm font-medium max-sm:h-11 sm:px-3 sm:py-1.5 transition-colors hover:text-foreground",
              active ? "bg-secondary text-foreground" : "text-muted-foreground",
            )}
          >
            {page.title}
          </Link>
        );
      })}
    </nav>
  );
}

// Reads the address bar; needs <Suspense> on pages whose address is only known when visited.
function NavLinksWithActive() {
  return <NavLinks activePath={usePathname()} />;
}

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background print:hidden">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-3 sm:gap-4 sm:px-6">
        <Link href="/" aria-label="Learn2Speech home" className="mr-auto text-lg font-medium">
          {/* just the bubble on phones, so the links and buttons fit */}
          <Logo className="text-lg max-sm:hidden" />
          <LogoMark className="h-7 w-auto sm:hidden" />
        </Link>
        <Suspense fallback={<NavLinks activePath={null} />}>
          <NavLinksWithActive />
        </Suspense>
        <div className="flex items-center gap-1">
          <SoundToggle />
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
