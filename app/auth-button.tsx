"use client"
import {useState, useEffect} from "react";
import {createClient} from "@/lib/supabase";
import {useRouter} from "next/navigation";
import Link from "next/link";
import type {User} from "@supabase/supabase-js";
import {LogIn, LogOut} from "lucide-react";
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
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
        }
    }

    if (loading) {
        return null;
    }
    if (user) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    {/* shows who is logged in; hidden when the sidebar is shrunk to icons */}
                    <p className="truncate px-2 pb-1 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">{user.email}</p>
                    <SidebarMenuButton onClick={() => setShowConfirm(true)} tooltip="Log out">
                        <LogOut />
                        <span>Log out</span>
                    </SidebarMenuButton>
                    {errorMessage && <p className="px-2 text-xs text-destructive">{errorMessage}</p>}

                    {/* The popup lives here in the code but is drawn on top of the whole page.
                        It only appears while its "open" prop is true. */}
                    <Dialog open = {showConfirm} onOpenChange = {(value) => setShowConfirm(false)}>
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
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/login" />} tooltip="Log in"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
                    <LogIn />
                    <span>Log in</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
