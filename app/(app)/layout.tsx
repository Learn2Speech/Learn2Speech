// Layout for the main pages (Home, Upload, History): top bar, the page, then the footer.
// The "(app)" folder name is a route group: the parentheses keep it out of the URL,
// so /upload is still /upload. Login and sign-up live outside it, so they get no top bar.
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <div className="flex flex-1 flex-col">{children}</div>
      {/* Terms and Privacy Policy live here */}
      <SiteFooter className="border-t" />
    </>
  );
}
