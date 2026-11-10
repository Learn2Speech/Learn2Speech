import {NextResponse} from "next/server"
import {createServerSupabase} from "@/lib/supabase-server"

// Google/Apple send people back here with a one-time ?code=. We swap it for a logged-in session
// (stored in the usual cookies), then send them home. The destination is fixed, never taken from the
// address, so this can't be used to bounce someone to another site.
export async function GET(request: Request) {
    const {origin, searchParams} = new URL(request.url)
    const code = searchParams.get("code")
    if (code) {
        const supabase = await createServerSupabase()
        const {error} = await supabase.auth.exchangeCodeForSession(code)
        if (!error) return NextResponse.redirect(`${origin}/`)
        console.error("OAuth sign-in failed:", error.code)
    }
    return NextResponse.redirect(`${origin}/login?oauth_error=1`)
}
