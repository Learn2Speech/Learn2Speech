"use client"
import {useState, useEffect} from "react";
import {createClient} from "@/lib/supabase";
import {useRouter} from "next/navigation";
import Link from "next/link";
import type {User} from "@supabase/supabase-js";
import {LogIn, LogOut} from "lucide-react";
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";
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
            <SidebarMenu>
                <SidebarMenuItem>
                    {/* shows who is logged in; hidden when the sidebar is shrunk to icons */}
                    <p className="truncate px-2 pb-1 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">{user.email}</p>
                    <SidebarMenuButton onClick={Logout} tooltip="Log out">
                        <LogOut />
                        <span>Log out</span>
                    </SidebarMenuButton>
                    {errorMessage && <p className="px-2 text-xs text-destructive">{errorMessage}</p>}
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
