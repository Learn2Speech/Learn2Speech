 "use client";
import {useState, Suspense} from "react";
import LoginNotice from "@/components/auth/login-notice";
import {createClient} from "@/lib/supabase";
import {useRouter} from "next/navigation";
import Link from "next/link";
import AuthCard, {AuthMessage} from "@/components/auth/auth-card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
export default function LoginPage() {
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[errorMessage, setErrorMessage] = useState("");
    // true while we wait for Supabase, so the button can't be clicked twice
    const[loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    async function Submission(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage("");
        setLoading(true);
        const {error} = await supabase.auth.signInWithPassword({email, password})
        setLoading(false);
        if (error) {
            setErrorMessage(error.message);
        } else {
            router.push("/")
            // refresh() throws away pages Next.js pre-loaded before the login state changed; without it,
            // clicking Upload or History can replay an old "go to login" answer until the page is refreshed
            router.refresh()
        }
    }
    return (
        <AuthCard
            title="Welcome back"
            subtitle="Log in to keep practicing."
            footer={<p>Don&apos;t have an account? <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">Sign up</Link></p>}>
            <form onSubmit={Submission} className="space-y-4">
                {/* Suspense: Next.js needs it around anything that reads the address bar, so the rest of the page can load first */}
                <Suspense fallback={null}><LoginNotice /></Suspense>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" autoComplete="current-password" required />
                </div>
                {errorMessage && <AuthMessage kind="error">{errorMessage}</AuthMessage>}
                <Button type="submit" disabled={loading} className="h-10 w-full">
                    {loading ? "Logging in..." : "Log in"}
                </Button>
            </form>
        </AuthCard>
    );

}

// When user presses the button, the page technically reboots as a new one. To make the thing remember the emal and password, we use usestate. Then using the locator file supabase gets the variables does its thing and belches them out and whie that happens we use await and that rsult is cataloged as rither data or error. 


