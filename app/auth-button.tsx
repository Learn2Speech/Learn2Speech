"use client"
import {useState, useEffect} from "react";
import {createClient} from "@/lib/supabase";
import {useRouter} from "next/navigation";
import Link from "next/link";
import type {User} from "@supabase/supabase-js";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button, buttonVariants} from "@/components/ui/button";
export default function AuthButton() {
    const [user, setUser]=useState<User | null>(null);
    const [loading, setLoading]=useState(true);
    const [errorMessage, setErrorMessage]=useState("");
    const supabase = createClient();
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
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
            // refresh() throws away pages Next.js pre-loaded before the login state changed; without it,
            // clicking Upload or History can replay an old "go to login" answer until the page is refreshed
            router.refresh()
        }
    }

    if (loading) {
        return null;
    }
    if (user) {
        return (
            <>
                <Button variant="ghost" onClick={() => setShowConfirm(true)} title={user.email ?? undefined}>Log out</Button>
                {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
                {/* The popup lives here in the code but is drawn on top of the whole page.
                    It only appears while its "open" prop is true. */}
                <Dialog open={showConfirm} onOpenChange={() => setShowConfirm(false)}>
                    <DialogContent showCloseButton={false}>
                        <DialogHeader>
                            <DialogTitle>Log out?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to log out of Learn2Speech?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button onClick={() => setShowConfirm(false)} variant="outline">Cancel</Button>
                            <Button onClick={() => { setShowConfirm(false); Logout(); }} variant="destructive">Yes, log out</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
    return <Link href="/login" className={buttonVariants()}>Log in</Link>;
}
