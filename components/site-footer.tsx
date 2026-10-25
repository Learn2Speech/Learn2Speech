// Footer with the legal links, shown under every page (main pages and login/sign-up),
// so the Terms and Privacy Policy are always one click away without crowding the sidebar.
import Link from "next/link";
import { cn } from "@/lib/utils";

const LINKS = [
  { title: "Terms and Conditions", href: "/terms" },
  { title: "Privacy Policy", href: "/privacy" },
];

export default function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-6 text-sm text-muted-foreground", className)}>
      <span>© 2026 Learn2Speech</span>
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="underline-offset-4 hover:text-foreground hover:underline">
          {link.title}
        </Link>
      ))}
    </footer>
  );
}
