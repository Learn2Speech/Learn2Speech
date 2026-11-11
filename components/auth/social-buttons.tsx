"use client";
// "Continue with Google / Apple" buttons for the login and sign-up pages. Only providers listed in
// NEXT_PUBLIC_OAUTH_PROVIDERS (e.g. "google,apple") are shown, so a provider isn't offered until it is
// switched on in Supabase. Signing in this way skips our birth-date question, so the notice below the
// buttons is how people agree to the terms and confirm they are 13+.
import {useState} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {createClient} from "@/lib/supabase";
import {AuthMessage} from "@/components/auth/auth-card";
import {Button} from "@/components/ui/button";

type Provider = "google" | "apple";
const LABELS: Record<Provider, string> = {google: "Google", apple: "Apple"};
const ICONS: Record<Provider, React.ReactNode> = {
    google: (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/>
            <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"/>
            <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z"/>
            <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"/>
        </svg>
    ),
    apple: (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="currentColor">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
        </svg>
    ),
};

export default function SocialButtons() {
    const providers = (process.env.NEXT_PUBLIC_OAUTH_PROVIDERS ?? "")
        .split(",").map((p) => p.trim()).filter((p): p is Provider => p === "google" || p === "apple");
    const[loading, setLoading] = useState<Provider | null>(null);
    const[errorMessage, setErrorMessage] = useState("");
    const failedBefore = useSearchParams().get("oauth_error") === "1";
    const supabase = createClient();
    if (providers.length === 0) return null;

    async function signIn(provider: Provider) {
        setErrorMessage("");
        setLoading(provider);
        const {error} = await supabase.auth.signInWithOAuth({provider, options: {redirectTo: `${window.location.origin}/auth/callback`}});
        // on success the browser leaves for Google/Apple, so loading stays on
        if (error) {
            setLoading(null);
            setErrorMessage("We couldn't start that sign-in. Please try again.");
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
            </div>
            {providers.map((provider) => (
                <Button key={provider} type="button" variant="outline" disabled={loading !== null} onClick={() => signIn(provider)} className="h-10 w-full gap-2">
                    {ICONS[provider]}{loading === provider ? "Redirecting..." : `Continue with ${LABELS[provider]}`}
                </Button>
            ))}
            {(errorMessage || failedBefore) && <AuthMessage kind="error">{errorMessage || "Sign-in didn't finish. Please try again."}</AuthMessage>}
            <p className="text-center text-xs text-muted-foreground">
                By continuing you confirm you are 13 or older and agree to the{" "}
                <Link href="/terms" target="_blank" className="underline underline-offset-4">Terms</Link> and{" "}
                <Link href="/privacy" target="_blank" className="underline underline-offset-4">Privacy Policy</Link>.
            </p>
        </div>
    );
}
