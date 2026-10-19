"use client"
import {useRouter} from "next/navigation";
export default function HistoryButton() {
    const router = useRouter();
    function goToHistory() {
        router.push("/history")
    }
    return (
        <button onClick = {goToHistory} className="rounded-md bg-zinc-800 px-4 py-2 font-medium text-white hover:bg-zinc-700">History</button>
    )
}