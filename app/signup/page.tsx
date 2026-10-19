"use client"
import {useState} from "react";
import {createClient} from "@/lib/supabase";
export default function SignUpPage() {
    const[email, setEmail]=useState("")
    const[password, setPassword]=useState("")
    const[errorMessage, setErrorMessage]=useState("")
    const[confirmMessage, setConfirmMessage]=useState("")
    const supabase = createClient();
    async function newSubmission(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage("")
        setConfirmMessage("")
        const {error} = await supabase.auth.signUp({email, password});
        if (error) {
            setErrorMessage(error.message)
        } else {
            setConfirmMessage("Check your email to confirm your account")
        }
    }
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <form onSubmit={newSubmission} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 text-zinc-900 shadow">
                <h1 className="text-2xl font-semibold">Sign Up</h1>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" required
                        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium">Password</label>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" required minLength={6}
                        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2" />
                </div>
                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
                {confirmMessage && <p className="text-sm text-green-700">{confirmMessage}</p>}
                <button type="submit"
                    className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700">Sign Up
                </button>
            </form>
        </main>
    );
}

