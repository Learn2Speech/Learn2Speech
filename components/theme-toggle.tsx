"use client"; // needs useTheme and a click handler
// Light/dark switch: an icon button in the top bar.
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  // resolvedTheme is "light" or "dark" even when the setting is "system"
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Switch theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* The server can't know your theme, so both icons are sent and CSS (dark:) shows the right one. */}
      <Moon className="dark:hidden" />
      <Sun className="hidden dark:block" />
    </Button>
  );
}
