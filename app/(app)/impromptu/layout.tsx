// Sets this page's browser-tab title.
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impromptu" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
