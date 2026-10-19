"use client"
import {createClient} from "@/lib/supabase";
import {useRouter} from "next/navigation";
import {useState} from "react";
export default function LogoutButton() {
    const supabase = createClient();
    const router = useRouter();
    const [errorMessage, setErrorMessage]=useState("");
    async function Logout() {
        const {error} = await supabase.auth.signOut()
        if (error) {
            setErrorMessage(error.message)
        } else {
            router.push("/login")
        }
    }
    return (
        <div>
            <button onClick={Logout} className="rounded-md bg-zinc-800 px-4 py-2 font-medium text-white hover:bg-zinc-700">Log Out</button>
            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        </div>
    );

}