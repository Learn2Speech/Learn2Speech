// "Skip to content": the first thing Tab reaches, hidden until focused, so keyboard and screen-reader users can
// jump past the top bar (WCAG 2.4.1). It points at the id="main" wrapper in app/(app)/layout.tsx.
export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-3 focus:ring-ring/50"
    >
      Skip to content
    </a>
  );
}
