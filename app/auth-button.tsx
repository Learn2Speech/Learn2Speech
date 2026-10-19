"use client"
import {useState, useEffect} from "react";
import {createClient} from "@/lib/supabase";
import {useRouter} from "next/navigation";
import Link from "next/link";
import type {User} from "@supabase/supabase-js";
export default function AuthButton() {
    const [user, setUser]=useState<User | null>(null);
    const [loading, setLoading]=useState(true);
    const [errorMessage, setErrorMessage]=useState("");
    const supabase = createClient();
    const router = useRouter();
    useEffect(() => {
        async function check() {
            const {data} = await supabase.auth.getUser();
            setUser(data.user);
            setLoading(false)
        }
        check();
    }, [supabase]);
    async function Logout() {
        const {error} = await supabase.auth.signOut()
        if (error) {
            setErrorMessage(error.message)
        } else {
            setUser(null);
            router.push("/")
        }
    }

    if (loading) {
        return null;
    }
    if (user) {
        return (
            <div>
                <button onClick={Logout} className="rounded-md bg-zinc-800 px-4 py-2 font-medium text-white hover:bg-zinc-700">Log Out</button>
                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
            </div>
        );
    }
    return (
        <Link href="/login" className="rounded-md bg-zinc-800 px-4 py-2 font-medium text-white hover:bg-zinc-700">Log In</Link>
    );
}
