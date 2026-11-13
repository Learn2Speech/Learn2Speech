// Layout for the main pages (Home, Upload, History): top bar, the page, then the footer.
// The "(app)" folder name is a route group: the parentheses keep it out of the URL,
// so /upload is still /upload. Login and sign-up live outside it, so they get no top bar.
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";
import SkipLink from "@/components/skip-link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteNav />
      {/* id="main" is where the skip link lands; tabIndex -1 lets it take focus without joining the Tab order */}
      <div id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">{children}</div>
      {/* Terms and Privacy Policy live here */}
      <SiteFooter className="border-t" />
    </>
  );
}
