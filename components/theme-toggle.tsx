"use client"; // needs useTheme and a click handler
// The light/dark switch at the bottom of the sidebar.
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export default function ThemeToggle() {
  // resolvedTheme is "light" or "dark" even when the setting is "system"
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          tooltip="Switch theme"
          className="h-10 gap-3 rounded-lg px-3 text-[0.95rem] [&_svg]:size-[1.15rem]"
        >
          {/* The server can't know your theme, so both versions are sent and CSS
              (dark:) shows the right one. Picking in code would flicker on load. */}
          <Moon className="dark:hidden" />
          <Sun className="hidden dark:block" />
          <span className="dark:hidden">Dark mode</span>
          <span className="hidden dark:inline">Light mode</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
