"use client"
import {useState, useEffect} from "react";
import {createClient} from "@/lib/supabase";
import {useRouter} from "next/navigation";
import Link from "next/link";
import type {User} from "@supabase/supabase-js";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button, buttonVariants} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Accessibility, LifeBuoy, LogOut} from "lucide-react";
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
                {/* account menu: a round button with your first letter; shows who's signed in, since phones have no hover tooltips */}
                <DropdownMenu>
                    <DropdownMenuTrigger aria-label="Account menu" className="flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:size-9">
                        <span className="flex size-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white uppercase">{user.email?.[0] ?? "?"}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
                            <p className="px-1.5 pb-1 text-sm font-medium break-all">{user.email}</p>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        {/* render as a real link, so it works like any other link (new tab, right-click) */}
                        <DropdownMenuItem render={<Link href="/accessibility" />}><Accessibility /> Accessibility</DropdownMenuItem>
                        {/* opens their email app with our address filled in */}
                        <DropdownMenuItem render={<a href="mailto:learn2speechteam@gmail.com?subject=Learn2Speech%20help" />}><LifeBuoy /> Help</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setShowConfirm(true)}><LogOut /> Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
    return <Link href="/login" className={buttonVariants({className: "max-sm:h-11"})}>Log in</Link>;
}
