"use client"; // needs usePathname to mark the page you're on
// Top bar on every main page: logo on the left, page links (Record / Impromptu / Upload, History, Tutorial,
// About), then sound, theme and account on the right.
import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "@/app/auth-button";
import Logo, { LogoMark } from "@/components/brand/logo";
import ThemeToggle from "@/components/theme-toggle";
import { SoundToggle } from "@/components/ui-sounds";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// needsLogin: the page guard sends logged-out visitors to /login, so we don't let Next.js
// pre-load it. A pre-load made while logged out saves the "go to login" answer, and clicking
// the link right after logging in would replay it (until a refresh).
// The three ways to practice: their own links on wide screens, a "Practice" menu on narrower ones.
const PRACTICE = [
  { title: "Record", href: "/record" },
  { title: "Impromptu", href: "/impromptu", isNew: true }, // newest mode: a "New" tag invites people to try it
  { title: "Upload", href: "/upload" },
];
const PAGES = [
  { title: "History", href: "/history", needsLogin: true, className: "" },
  { title: "Tutorial", href: "/demo", needsLogin: false, className: "" },
  // in the footer too; on phones only there, so the top bar fits
  { title: "About", href: "/about", needsLogin: false, className: "max-sm:hidden" },
];

const LINK = "flex items-center gap-1 rounded-md px-1 text-sm sm:gap-1.5 font-medium max-sm:h-11 sm:px-3 sm:py-1.5 transition-colors hover:text-foreground";

// the same orange-tinted tag as the Impromptu badge on History
function NewTag() {
  return <span className="rounded-full border border-orange/40 bg-orange/10 px-1.5 text-[0.6875rem] leading-4 font-semibold text-foreground">New</span>;
}

function NavLink({ href, title, active, prefetch, className, children }: {
  href: string; title: string; active: boolean; prefetch: boolean; className?: string; children?: React.ReactNode;
}) {
  return (
    <Link href={href} prefetch={prefetch} aria-current={active ? "page" : undefined}
      className={cn(LINK, active ? "bg-secondary text-foreground" : "text-muted-foreground", className)}>
      {title}{children}
    </Link>
  );
}

// activePath is the page you're on, or null while unknown.
function NavLinks({ activePath }: { activePath: string | null }) {
  const isActive = (href: string) => !!activePath?.startsWith(href);
  const onPractice = PRACTICE.some((p) => isActive(p.href));
  return (
    <nav aria-label="Main" className="flex items-center sm:gap-1">
      {PRACTICE.map((p) => (
        <NavLink key={p.href} href={p.href} title={p.title} active={isActive(p.href)} prefetch={false} className="max-lg:hidden">
          {p.isNew && <NewTag />}
        </NavLink>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger className={cn(LINK, "outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:hidden", onPractice ? "bg-secondary text-foreground" : "text-muted-foreground")}>
          Practice
          {/* a small orange dot = something new inside (the tag itself is in the menu) */}
          <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
          <span className="sr-only">(new: Impromptu)</span>
          <ChevronDown aria-hidden="true" className="size-3.5 max-sm:hidden" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {PRACTICE.map((p) => (
            <DropdownMenuItem key={p.href} render={<Link href={p.href} prefetch={false} aria-current={isActive(p.href) ? "page" : undefined} />}>
              {p.title}{p.isNew && <NewTag />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {PAGES.map((page) => (
        <NavLink key={page.href} href={page.href} title={page.title} active={isActive(page.href)} prefetch={!page.needsLogin} className={page.className} />
      ))}
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
