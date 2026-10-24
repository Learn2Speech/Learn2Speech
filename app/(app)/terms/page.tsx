// Terms and conditions. Plain text only, so it stays a Server Component (no "use client").
// It lives in (app) so it gets the sidebar, but nothing here checks login: anyone can read it.
import PageHeader from "@/components/page-header";

// Each section is a heading + paragraph. Add a section by adding one entry here.
// Keep these honest: they should describe what the app actually does.
const SECTIONS = [
  {
    heading: "What Learn2Speech is",
    body: "Learn2Speech helps you practice speaking by measuring your pace, filler words and pauses, and giving you coaching tips. It is a learning tool, not professional speech therapy.",
  },
  {
    heading: "Your recordings",
    body: "When you upload audio, we store the file and its transcript in your account. Only you can see your recordings and results. Please only upload recordings of your own voice, or of people who have agreed to be recorded.",
  },
  {
    heading: "How we use AI",
    body: "Your audio is sent to AssemblyAI to be turned into text. The transcript and your speaking stats are sent to Anthropic's Claude to write your coaching feedback. AI feedback can be wrong, so treat it as suggestions, not facts.",
  },
  {
    heading: "Using the app fairly",
    body: "Don't upload anything illegal, hateful, or that you don't have the right to share, and don't try to access other people's accounts or data.",
  },
  {
    heading: "No guarantees",
    body: "The app is provided as is. It may have bugs, be down sometimes, or change without notice.",
  },
  {
    heading: "Changes and questions",
    // TODO(Akshith): add a contact email for the team
    body: "We may update these terms as the app changes. If you have questions or want your data removed, contact the Learn2Speech team.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <PageHeader title="Terms and Conditions" description="Last updated October 24, 2026" />
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <p className="leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
