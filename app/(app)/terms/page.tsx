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
    heading: "Who can use it",
    body: "You must be 13 or older to use Learn2Speech.",
  },
  {
    heading: "Your recordings",
    body: "When you upload audio, we store the file and its transcript in your account. Only you can see your recordings and results. Please only upload recordings of your own voice, or people who have agreed to be recorded. To keep costs under control, each account can analyze a limited number of recordings per day.",
  },
  {
    heading: "Your content and your rights",
    body: "You keep ownership of your recordings and results. You give Learn2Speech permission to store and process them only to run the app for you, including sending them to the AI services described below. You promise that you have the right to upload what you upload.",
  },
  {
    heading: "Copyright",
    body: "Don't upload audio you don't have the right to use, such as songs, or other people's speeches, lectures or recordings that you weren't given permission to use. If you believe something stored on Learn2Speech infringes your copyright, email learn2speechproject@gmail.com with what the work is, where you found it, your name and contact details, and a statement that you own the work or are allowed to act for the owner. We will review it and remove content that infringes, and we may close accounts that repeatedly upload it.",
  },
  {
    heading: "How we use AI",
    body: "Your audio is sent to AssemblyAI to be turned into text. The transcript and your speaking stats are sent to Anthropic's Claude to write your coaching feedback. Both companies handle that data under their own privacy policies. AI feedback can be wrong, so treat it as suggestions, not facts.",
  },
  {
    heading: "Using the app fairly",
    body: "Don't upload anything illegal, hateful, or that you don't have the right to share, and don't try to access other people's accounts or data.",
  },
  {
    heading: "Ending your account",
    body: "You can stop using Learn2Speech at any time and ask us to delete your data. We may suspend or close an account that breaks these terms.",
  },
  {
    heading: "No guarantees",
    body: "The app is provided as is. It may have bugs, be down sometimes, or change without notice. To the extent the law allows, Learn2Speech is not responsible for losses that come from using the app, including lost recordings or mistakes in AI feedback.",
  },
  {
    heading: "Changes and questions",
    body: "We may update these terms as the app changes. If you have questions or want your data removed, email learn2speechproject@gmail.com.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <PageHeader title="Terms and Conditions" description="Last updated November 10, 2026" />
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
