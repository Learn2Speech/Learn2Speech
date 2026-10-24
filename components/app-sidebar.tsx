"use client"; // needs usePathname to highlight the page you're on
// The side panel on every main page: logo, the page links, and your account at the bottom.
import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, House, Upload } from "lucide-react";
import AuthButton from "@/app/auth-button";
import Logo, { LogoMark } from "@/components/brand/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Add a page to the sidebar by adding one line here.
const PAGES = [
  { title: "Home", href: "/", icon: House },
  { title: "Upload", href: "/upload", icon: Upload },
  { title: "History", href: "/history", icon: History },
];

// The page links. activePath is the page you're on (highlighted), or null while unknown.
function NavLinks({ activePath }: { activePath: string | null }) {
  return (
    <SidebarMenu>
      {PAGES.map((page) => (
        <SidebarMenuItem key={page.href}>
          <SidebarMenuButton
            render={<Link href={page.href} />}
            // /history/123 still highlights History, but / only highlights Home on the home page
            isActive={page.href === "/" ? activePath === "/" : activePath?.startsWith(page.href) ?? false}
            tooltip={page.title}
            // the page you're on becomes a solid orange pill; the rest stay quiet until hovered
            className="h-10 gap-3 rounded-lg px-3 text-[0.95rem] data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary [&_svg]:size-[1.15rem]"
          >
            <page.icon />
            <span>{page.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// Reads the address bar. On pages like /history/123 the address is only known when someone
// visits, so Next.js needs this inside <Suspense> (below), with plain links shown until then.
function NavLinksWithActive() {
  return <NavLinks activePath={usePathname()} />;
}

export default function AppSidebar() {
  return (
    // collapsible="icon": on desktop the panel can shrink to just icons instead of hiding
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border pb-3">
        {/* text-white: the wordmark is plain text, so it needs a light color on the dark panel */}
        <Link href="/" className="flex h-10 items-center px-2 text-xl font-semibold text-white">
          {/* full logo when open, just the bubble when collapsed to icons */}
          <Logo className="text-xl group-data-[collapsible=icon]:hidden" />
          <LogoMark className="hidden h-6 w-auto group-data-[collapsible=icon]:block" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-4">
          <SidebarGroupContent>
            <Suspense fallback={<NavLinks activePath={null} />}>
              <NavLinksWithActive />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border pt-3">
        <AuthButton />
      </SidebarFooter>
      {/* thin strip on the edge you can click to open/close the panel */}
      <SidebarRail />
    </Sidebar>
  );
}
