"use client"
import {useState} from "react";
import {createClient} from "@/lib/supabase";
import Link from "next/link";
import {useRouter} from "next/navigation";
import AuthCard, {AuthMessage} from "@/components/auth/auth-card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
export default function SignUpPage() {
    const[email, setEmail]=useState("")
    const[password, setPassword]=useState("")
    const[errorMessage, setErrorMessage]=useState("")
    const[confirmMessage, setConfirmMessage]=useState("")
    // true while we wait for Supabase, so the button can't be clicked twice
    const[loading, setLoading]=useState(false)
    const supabase = createClient();
    const router = useRouter();
    async function newSubmission(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage("")
        setConfirmMessage("")
        setLoading(true)
        const {data, error} = await supabase.auth.signUp({email, password});
        setLoading(false)
        if (error) {
            setErrorMessage(error.message)
        } else if (data.session) {
            // email confirmation is off in Supabase, so the new account is already logged in
            router.push("/")
        } else {
            // only happens if "Confirm email" is turned back on in Supabase
            setConfirmMessage("Check your email to confirm your account")
        }
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
                {confirmMessage && <AuthMessage kind="success">{confirmMessage}</AuthMessage>}
                <Button type="submit" disabled={loading} className="h-10 w-full">
                    {loading ? "Creating account..." : "Sign up"}
                </Button>
            </form>
        </AuthCard>
    );
}

