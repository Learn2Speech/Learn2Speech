"use client"
// The "type the 6-digit code we emailed you" step.
// Used by the sign-up page (right after signing up) and the login page
// (when someone signed up earlier but never typed their code).
import {useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase";
import {AuthMessage} from "@/components/auth/auth-card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

type VerifyCodeFormProps = {
    email: string;
    note?: string; // optional green line on top, e.g. "We just sent you a new code"
};

export default function VerifyCodeForm({email, note}: VerifyCodeFormProps) {
    const[code, setCode] = useState("");
    const[errorMessage, setErrorMessage] = useState("");
    const[infoMessage, setInfoMessage] = useState(note ?? "");
    // two separate flags, so "Verify" and "Resend" can't both run at once or be double clicked
    const[verifying, setVerifying] = useState(false);
    const[resending, setResending] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    async function checkCode(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage("");
        setInfoMessage("");
        setVerifying(true);
        // Supabase compares the code with the one it emailed. If it matches, the
        // account is confirmed and the user is logged in right away.
        const {error} = await supabase.auth.verifyOtp({email, token: code, type: "signup"});
        if (error) {
            setVerifying(false);
            // otp_expired is what Supabase says for both a wrong code and an old one
            setErrorMessage(error.code === "otp_expired"
                ? "That code is wrong or has expired. Check the newest email, or send a new code."
                : error.message);
        } else {
            // leave verifying on, so the button stays disabled while the next page loads
            router.push("/");
            router.refresh();
        }
    }

    async function resendCode() {
        setErrorMessage("");
        setInfoMessage("");
        setResending(true);
        const {error} = await supabase.auth.resend({type: "signup", email});
        setResending(false);
        if (error) {
            setErrorMessage(error.code === "over_email_send_rate_limit"
                ? "Please wait a minute before asking for another code."
                : error.message);
        } else {
            setCode("");
            setInfoMessage("New code sent. Only the newest code works.");
        }
    }

    return (
        <form onSubmit={checkCode} className="space-y-4">
            <p className="text-sm text-muted-foreground">
                We emailed a 6-digit code to <span className="font-medium text-foreground">{email}</span>. Type it here to finish.
            </p>
            {infoMessage && <AuthMessage kind="success">{infoMessage}</AuthMessage>}
            <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                {/* keep only digits, so a pasted "123 456" still works */}
                <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                    pattern="[0-9]{6}" title="The 6 digits from the email" required
                    className="h-10 text-center font-mono text-lg tracking-[0.5em]" />
            </div>
            {errorMessage && <AuthMessage kind="error">{errorMessage}</AuthMessage>}
            <Button type="submit" disabled={verifying || resending} className="h-10 w-full">
                {verifying ? "Checking..." : "Verify"}
            </Button>
            <Button type="button" variant="ghost" onClick={resendCode} disabled={verifying || resending} className="w-full">
                {resending ? "Sending..." : "Didn't get it? Send a new code"}
            </Button>
        </form>
    );
}
