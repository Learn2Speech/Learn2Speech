"use client"; // needs usePathname to highlight the page you're on
// The side panel on every main page: logo, the page links, and your account at the bottom.
import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, History, House, Upload } from "lucide-react";
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
  { title: "Terms", href: "/terms", icon: FileText },
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
      <SidebarHeader>
        <Link href="/" className="flex h-10 items-center px-2 text-xl">
          {/* full logo when open, just the bubble when collapsed to icons */}
          <Logo className="text-xl group-data-[collapsible=icon]:hidden" />
          <LogoMark className="hidden h-6 w-auto group-data-[collapsible=icon]:block" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Suspense fallback={<NavLinks activePath={null} />}>
              <NavLinksWithActive />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <AuthButton />
      </SidebarFooter>
      {/* thin strip on the edge you can click to open/close the panel */}
      <SidebarRail />
    </Sidebar>
  );
}
