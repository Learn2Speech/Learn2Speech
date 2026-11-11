// Title + short description at the top of a page, so every page starts the same way.
export default function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-10">
      <h1 className="text-4xl leading-[1.02] font-semibold sm:text-5xl">{title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{description}</p>
    </div>
  );
}
