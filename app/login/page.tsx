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
import VerifyCodeForm from "@/components/auth/verify-code-form";
export default function LoginPage() {
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[errorMessage, setErrorMessage] = useState("");
    // true while we wait for Supabase, so the button can't be clicked twice
    const[loading, setLoading] = useState(false);
    // filled in when someone signed up but never typed their code; switches to the code step
    const[needsCode, setNeedsCode] = useState("");
    const[codeNote, setCodeNote] = useState("");
    const supabase = createClient();
    const router = useRouter();
    async function Submission(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage("");
        setLoading(true);
        const {error} = await supabase.auth.signInWithPassword({email, password})
        if (error && error.code === "email_not_confirmed") {
            // Their old code may have expired, so send a fresh one before showing the code step.
            const resent = await supabase.auth.resend({type: "signup", email});
            setLoading(false);
            setCodeNote(resent.error
                ? "Your email isn't confirmed yet. Use the code we sent you earlier, or send a new one below."
                : "Your email isn't confirmed yet. We just sent you a new code.");
            setNeedsCode(email);
        } else if (error) {
            setLoading(false);
            setErrorMessage(error.message);
        } else {
            setLoading(false);
            router.push("/")
        }
    }
    if (needsCode) {
        return (
            <AuthCard
                title="Confirm your email"
                subtitle="Type the code to finish setting up your account."
                footer={<p>Wrong email? <button type="button" onClick={() => setNeedsCode("")} className="font-medium text-foreground underline-offset-4 hover:underline">Go back</button></p>}>
                <VerifyCodeForm email={needsCode} note={codeNote} />
            </AuthCard>
        );
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


