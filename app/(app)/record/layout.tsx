// Sets this page's browser-tab title; the page itself is a client component, which can't export metadata.
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Record" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
