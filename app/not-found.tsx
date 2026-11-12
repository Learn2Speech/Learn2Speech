// Addresses that match no page at all land here, outside the (app) layout, so this adds the top bar and footer itself.
import type { Metadata } from "next";
import SiteFooter from "@/components/site-footer";
import SiteNav from "@/components/site-nav";
import NotFound from "./(app)/not-found";

export const metadata: Metadata = { title: "Page not found" };

export default function GlobalNotFound() {
  return (
    <>
      <SiteNav />
      <div className="flex flex-1 flex-col">
        <NotFound />
      </div>
      <SiteFooter className="border-t" />
    </>
  );
}
