// The "Record | Impromptu | Upload" switch at the top of the practice pages. They stay real pages
// (so links, the back button and the login guard all keep working); this just makes them feel like one.
import Link from "next/link";
import { Mic, Shuffle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { href: "/record", label: "Record", Icon: Mic },
  { href: "/impromptu", label: "Impromptu", Icon: Shuffle },
  { href: "/upload", label: "Upload", Icon: Upload },
];

export default function PracticeSwitch({ current }: { current: "/record" | "/impromptu" | "/upload" }) {
  return (
    <nav aria-label="How to practice" className="mb-6 inline-flex sm:mb-8 rounded-lg border bg-secondary p-1">
      {OPTIONS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={href === current ? "page" : undefined}
          className={cn(
            "flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors sm:px-4",
            href === current ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" /> {label}
        </Link>
      ))}
    </nav>
  );
}
