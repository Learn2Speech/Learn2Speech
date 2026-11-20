"use client"; // watches clicks, typing and tab switches
// Logs you out after 30 minutes away from the app, so the next person on a shared or school computer can't
// open your recordings. "Away" starts when you stop clicking, typing or scrolling, or leave the tab. Coming
// back later (or leaving the tab open and untouched) sends you to the login page with a note saying why.
// Only this browser is logged out (scope "local"); your other devices stay signed in.
// The last-active time is kept in this browser's storage, shared by all its tabs, so using the app in one
// tab keeps the others signed in too. It's saved with the login's session id: a new login starts a fresh
// clock, while a reload or a refreshed token (same session) keeps the old one.
// shortcut: checked in the browser, so a page opened after a long time away can show for a moment before
// the redirect; enforce in proxy.ts (with a server-set time) if that ever matters.
import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { PAGE_NAMES } from "@/components/auth/login-notice";

export const AWAY_MINUTES = 30;
const KEY = "l2s-last-active"; // "time|sessionId"

const read = (): [number, string] => {
  try {
    const [time, id] = (localStorage.getItem(KEY) ?? "").split("|");
    return [Number(time) || 0, id ?? ""];
  } catch { return [0, ""]; }
};
const write = (value: string) => { try { localStorage.setItem(KEY, value); } catch {} };
// the login's id inside its access token (it stays the same when the token is refreshed)
function sessionId(accessToken: string): string {
  try {
    const part = accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return String(JSON.parse(atob(part)).session_id ?? "");
  } catch { return ""; }
}

export default function SessionTimeout() {
  useEffect(() => {
    const supabase = createClient();
    let checking = false;

    // active: the person is here right now (click, key, scroll, page load, tab switch), so if they're not
    // past the limit their clock restarts. The once-a-minute timer only checks, it never restarts the clock.
    async function check(active: boolean) {
      if (checking) return;
      checking = true;
      const { data: { session } } = await supabase.auth.getSession(); // reads this browser's login, no network
      checking = false;
      if (!session) return; // logged out, or still loading: nothing to time
      const now = Date.now();
      const id = sessionId(session.access_token);
      const [last, lastId] = read();
      if (lastId === id && last && now - last > AWAY_MINUTES * 60_000) {
        // the saved time is left as it is: if this sign-out gets cut off (tab closed), the next visit catches
        // it again, and the next login has a new session id, so its clock starts fresh anyway
        await supabase.auth.signOut({ scope: "local" });
        const page = window.location.pathname.split("/")[1];
        // ?from= brings them back to the page they were on after logging in again (only pages we know)
        window.location.replace(`/login?expired=1${Object.hasOwn(PAGE_NAMES, page) ? `&from=${page}` : ""}`);
        return;
      }
      // a new login (different id) always starts its clock; otherwise save at most once a minute
      if (lastId !== id || (active && now - last >= 60_000)) write(`${now}|${id}`);
    }

    const here = () => check(true);
    const events = ["pointerdown", "keydown", "scroll", "visibilitychange", "focus"] as const;
    here();
    events.forEach((e) => window.addEventListener(e, here, { passive: true }));
    const timer = setInterval(() => check(false), 60_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, here));
      clearInterval(timer);
    };
  }, []);
  return null;
}
