// Title + short description at the top of a page, so every page starts the same way.
export default function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8 space-y-1">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
