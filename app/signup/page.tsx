"use client"
import {useState} from "react";
import {createClient} from "@/lib/supabase";
import Link from "next/link";
import {useRouter} from "next/navigation";
import AuthCard, {AuthMessage} from "@/components/auth/auth-card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {isOldEnough} from "@/lib/age-check";

// Options for the birth month / year dropdowns. Years go back 100 years from now.
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({length: 100}, (_, i) => THIS_YEAR - i);
// Remembers for this browser session (until the browser is closed) that someone was too young, so going
// back and picking an older year doesn't work. Session only, so one misclick doesn't lock anyone out forever.
const UNDER_AGE_KEY = "l2s-under-13";
// Same look as our text inputs
const SELECT_CLASS = "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";
export default function SignUpPage() {
    const[email, setEmail]=useState("")
    const[password, setPassword]=useState("")
    const[errorMessage, setErrorMessage]=useState("")
    const[confirmMessage, setConfirmMessage]=useState("")
    // true while we wait for Supabase, so the button can't be clicked twice
    const[loading, setLoading]=useState(false)
    // the Sign up button stays disabled until the terms + privacy box is ticked
    const[agreed, setAgreed]=useState(false)
    // birth month (1-12) and year, only used for the age check below and never sent to Supabase
    const[birthMonth, setBirthMonth]=useState("")
    const[birthYear, setBirthYear]=useState("")
    const supabase = createClient();
    const router = useRouter();
    async function newSubmission(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage("")
        setConfirmMessage("")
        // Age check (Claude wrote this part at Rian's request): Learn2Speech is 13+ only (COPPA)
        if (!birthMonth || !birthYear) {
            setErrorMessage("Please choose your birth month and year.")
            return;
        }
        // The first version saved the block permanently (localStorage); clear that so stuck browsers recover
        try { localStorage.removeItem(UNDER_AGE_KEY); } catch {}
        let blockedBefore = false;
        try { blockedBefore = sessionStorage.getItem(UNDER_AGE_KEY) === "1"; } catch {}
        if (blockedBefore || !isOldEnough(Number(birthYear), Number(birthMonth))) {
            try { sessionStorage.setItem(UNDER_AGE_KEY, "1"); } catch {}
            setErrorMessage("Sorry, you need to be 13 or older to use Learn2Speech.")
            return;
        }
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
                {/* Neutral age question: asks the date without hinting at the cutoff (FTC guidance) */}
                <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">Date of birth</legend>
                    <div className="grid grid-cols-2 gap-2">
                        <select aria-label="Birth month" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} required className={SELECT_CLASS}>
                            <option value="" disabled>Month</option>
                            {MONTHS.map((month, i) => <option key={month} value={i + 1}>{month}</option>)}
                        </select>
                        <select aria-label="Birth year" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} required className={SELECT_CLASS}>
                            <option value="" disabled>Year</option>
                            {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                    <p className="text-xs text-muted-foreground">Only used to check your age. We don&apos;t save it.</p>
                </fieldset>
                {/* The terms and privacy policy open in a new tab so the email and password typed here aren't lost */}
                <div className="flex items-start gap-2">
                    <input checked={agreed} onChange={(e) => setAgreed(e.target.checked)} id="agree" type="checkbox" className="mt-0.5 size-4 accent-primary" />
                    <Label htmlFor="agree" className="text-sm font-normal leading-snug">
                        <span>I agree to the <Link href="/terms" target="_blank" className="font-medium text-foreground underline underline-offset-4">Terms and Conditions</Link> and the <Link href="/privacy" target="_blank" className="font-medium text-foreground underline underline-offset-4">Privacy Policy</Link></span>
                    </Label>
                </div>
                {errorMessage && <AuthMessage kind="error">{errorMessage}</AuthMessage>}
                {confirmMessage && <AuthMessage kind="success">{confirmMessage}</AuthMessage>}
                <Button type="submit" disabled={loading || !agreed} className="h-10 w-full">
                    {loading ? "Creating account..." : "Sign up"}
                </Button>
            </form>
        </AuthCard>
    );
}

