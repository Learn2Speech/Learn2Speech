 "use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase";
import {useRouter} from "next/navigation";
export default function LoginPage() {
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[errorMessage, setErrorMessage] = useState("");
    const supabase = createClient();
    const router = useRouter();
    async function Submission(event: React.FormEvent) {
        event.preventDefault();
        setErrorMessage("");
        const {error} = await supabase.auth.signInWithPassword({email, password})
        if (error) {
            setErrorMessage(error.message);
        } else {
            router.push("/")
        }
    }
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <form onSubmit={Submission} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 text-zinc-900 shadow">
                <h1 className="text-2xl font-semibold">Log In</h1>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" required
                        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2" />
                </div>
                <div> 
                    <label htmlFor="password" className="block text-sm font-medium">Password</label>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" required
                        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2" />
                    {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
                </div>
                <button type="submit"
                    className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700">Log In
                </button>
            </form>
        </main>
    );

}

// When user presses the button, the page technically reboots as a new one. To make the thing remember the emal and password, we use usestate. Then using the locator file supabase gets the variables does its thing and belches them out and whie that happens we use await and that rsult is cataloged as rither data or error. 


