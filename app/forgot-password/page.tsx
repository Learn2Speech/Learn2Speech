"use client";
// Forgot password, in two steps: (1) type your email and we send a 6-digit code,
// (2) type the code and a new password (twice). Same code style as sign-up.
import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase";
import AuthCard, {AuthMessage} from "@/components/auth/auth-card";
import PasswordInput from "@/components/auth/password-input";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

export default function ForgotPasswordPage() {
    const[email, setEmail] = useState("");
    // empty until step 1 is done; then the page swaps to the "type your code" step
    const[sentTo, setSentTo] = useState("");
    const[code, setCode] = useState("");
    const[password, setPassword] = useState("");
    const[confirmPassword, setConfirmPassword] = useState("");
    const[errorMessage, setErrorMessage] = useState("");
    const[loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    async function sendCode(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage("");
        setLoading(true);
        const {error} = await supabase.auth.resetPasswordForEmail(email);
        setLoading(false);
        // Supabase says "fine" even for emails with no account, so strangers can't test who is signed up.
        // We only show real problems like the send limit.
        if (error) {
            setErrorMessage(error.code === "over_email_send_rate_limit"
                ? "Please wait a minute before asking for another code."
                : "We couldn't send the code. Please try again.");
        } else {
            setSentTo(email);
        }
    }

    async function resetPassword(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage("");
        if (password !== confirmPassword) {
            setErrorMessage("The two passwords don't match.");
            return;
        }
        setLoading(true);
        // The code proves they own the email; it also logs them in so updateUser is allowed.
        const {error: codeError} = await supabase.auth.verifyOtp({email: sentTo, token: code, type: "recovery"});
        if (codeError) {
            setLoading(false);
            setErrorMessage("That code is wrong or has expired. Check the newest email, or go back and send a new code.");
            return;
        }
        const {error: updateError} = await supabase.auth.updateUser({password});
        if (updateError) {
            setLoading(false);
            setErrorMessage(updateError.code === "same_password"
                ? "Choose a password you haven't used before."
                : "We couldn't save your new password. Please try again.");
            return;
        }
        // leave loading on, so the button stays disabled while the next page loads
        router.push("/");
        router.refresh();
    }

    if (sentTo) {
        return (
            <AuthCard
                title="Check your email"
                subtitle="Type the code and choose a new password."
                footer={<p>Wrong email? <button type="button" onClick={() => setSentTo("")} className="font-medium text-foreground underline-offset-4 hover:underline">Go back</button></p>}>
                <form onSubmit={resetPassword} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, we emailed it a 6-digit code.
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="code">Code</Label>
                        {/* keep only digits, so a pasted "123 456" still works */}
                        <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                            id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                            pattern="[0-9]{6}" title="The 6 digits from the email" required
                            className="h-10 text-center font-mono text-lg tracking-[0.5em]" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">New password</Label>
                        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} id="password" autoComplete="new-password" required minLength={8} />
                        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm new password</Label>
                        <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} id="confirm-password" autoComplete="new-password" required minLength={8} />
                    </div>
                    {errorMessage && <AuthMessage kind="error">{errorMessage}</AuthMessage>}
                    <Button type="submit" disabled={loading} className="h-10 w-full">
                        {loading ? "Saving..." : "Set new password"}
                    </Button>
                </form>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="Forgot your password?"
            subtitle="Type your email and we'll send you a 6-digit code."
            footer={<p>Remembered it? <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Log in</Link></p>}>
            <form onSubmit={sendCode} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" autoComplete="email" required />
                </div>
                {errorMessage && <AuthMessage kind="error">{errorMessage}</AuthMessage>}
                <Button type="submit" disabled={loading} className="h-10 w-full">
                    {loading ? "Sending..." : "Send code"}
                </Button>
            </form>
        </AuthCard>
    );
}
