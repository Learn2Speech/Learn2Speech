"use client"
import {useState} from "react";
import {createClient} from "@/lib/supabase";
import Link from "next/link";
import AuthCard, {AuthMessage} from "@/components/auth/auth-card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import VerifyCodeForm from "@/components/auth/verify-code-form";
import {useRouter} from "next/navigation";
export default function SignUpPage() {
    const[email, setEmail]=useState("")
    const[password, setPassword]=useState("")
    const[errorMessage, setErrorMessage]=useState("")
    // empty until sign-up works; then it holds the email the code was sent to,
    // and the page swaps the form for the "type your code" step
    const[codeSentTo, setCodeSentTo]=useState("")
    // true while we wait for Supabase, so the button can't be clicked twice
    const[loading, setLoading]=useState(false)
    const supabase = createClient();
    const router = useRouter();
    async function newSubmission(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage("")
        setLoading(true)
        const {data, error} = await supabase.auth.signUp({email, password});
        setLoading(false)
        if (error) {
            setErrorMessage(error.message)
        } else if (data.user && data.user.identities?.length === 0) {
            // Supabase answers "fine" for an email that already has a confirmed account
            // (so strangers can't test which emails are signed up), but sends no code.
            setErrorMessage("An account with this email already exists. Try logging in.")
        } else if (data.session) {
            // only happens if email confirmation is turned off in Supabase: already logged in
            router.push("/")
        } else {
            setCodeSentTo(email)
        }
    }
    if (codeSentTo) {
        return (
            <AuthCard
                title="Check your email"
                subtitle="One last step to create your account."
                footer={<p>Wrong email? <button type="button" onClick={() => setCodeSentTo("")} className="font-medium text-foreground underline-offset-4 hover:underline">Go back</button></p>}>
                <VerifyCodeForm email={codeSentTo} />
            </AuthCard>
        );
    }
    return (
        <AuthCard
            title="Welcome to Learn2Speech"
            subtitle="Create a free account and get feedback on your first speech in minutes."
            footer={<p>Already have an account? <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Log in</Link></p>}>
            <form onSubmit={newSubmission} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" autoComplete="new-password" required minLength={6} />
                    <p className="text-xs text-muted-foreground">At least 6 characters.</p>
                </div>
                {errorMessage && <AuthMessage kind="error">{errorMessage}</AuthMessage>}
                <Button type="submit" disabled={loading} className="h-10 w-full">
                    {loading ? "Creating account..." : "Sign up"}
                </Button>
            </form>
        </AuthCard>
    );
}

