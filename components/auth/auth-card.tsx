// The frame both the login and sign-up pages sit in, so they always match:
// logo on top, then a centered card with a title, short subtitle, the form, and a footer link.
import Link from "next/link";
import Logo from "@/components/brand/logo";
import Waveform from "@/components/brand/waveform";
import SiteFooter from "@/components/site-footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode; // the page's own form goes here
  footer: React.ReactNode; // e.g. "Don't have an account? Sign up"
};

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-muted px-4 py-10">
      <Waveform className="absolute inset-x-0 bottom-0 h-56 px-4 opacity-60" />
      <Link href="/" aria-label="Learn2Speech home" className="relative">
        <Logo className="text-3xl" />
      </Link>
      <Card className="relative w-full max-w-sm border-t-4 border-t-primary shadow-lg [--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="font-heading text-3xl font-bold">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">{footer}</CardFooter>
      </Card>
      <SiteFooter className="relative py-0" />
    </main>
  );
}

// A message box under the form. "error" is red, "success" is green.
export function AuthMessage({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  const colors =
    kind === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-green-600/30 bg-green-600/10 text-green-700";
  // role="alert" makes screen readers announce the message as soon as it appears
  return (
    <p role="alert" className={`rounded-md border px-3 py-2 text-sm ${colors}`}>
      {children}
    </p>
  );
}
