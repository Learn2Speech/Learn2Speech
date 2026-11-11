// The "Record | Upload a file" switch at the top of both practice pages. They stay two real pages
// (so links, the back button and the login guard all keep working); this just makes them feel like one.
import Link from "next/link";
import { Mic, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { href: "/record", label: "Record", Icon: Mic },
  { href: "/upload", label: "Upload a file", Icon: Upload },
];

export default function PracticeSwitch({ current }: { current: "/record" | "/upload" }) {
  return (
    <nav aria-label="How to practice" className="mb-8 inline-flex rounded-lg border bg-secondary p-1">
      {OPTIONS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={href === current ? "page" : undefined}
          className={cn(
            "flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors",
            href === current ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" /> {label}
        </Link>
      ))}
    </nav>
  );
}
