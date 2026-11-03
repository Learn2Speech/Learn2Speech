// Layout for the main pages (Home, Upload, History): sidebar on the left, page on the right.
// The "(app)" folder name is a route group: the parentheses keep it out of the URL,
// so /upload is still /upload. Login and sign-up live outside it, so they get no sidebar.
import Link from "next/link";
import AppSidebar from "@/components/app-sidebar";
import Logo from "@/components/brand/logo";
import SiteFooter from "@/components/site-footer";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // TooltipProvider: shows page names on hover when the sidebar is shrunk to icons
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* top bar with the button that opens/closes the sidebar (the only way to open it on phones) */}
          <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur">
            <SidebarTrigger />
            {/* on phones the sidebar is hidden, so show the logo up here instead */}
            <Link href="/" className="md:hidden">
              <Logo className="text-lg" />
            </Link>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
          {/* Terms and Privacy Policy live here instead of in the sidebar */}
          <SiteFooter className="border-t" />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
