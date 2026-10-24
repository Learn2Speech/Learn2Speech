import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// Tells React how to listen for the screen crossing the phone/desktop width.
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

// Rewritten from shadcn's version (which set state inside an effect, which our lint rules reject).
// useSyncExternalStore is React's built-in way to read a value that lives outside React.
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches, // in the browser
    () => false // on the server there is no screen, so assume desktop
  )
}
