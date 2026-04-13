const stats = [
  { value: "1,240", label: "Total Users" },
  { value: "48,500", label: "XP Earned" },
  { value: "3,890", label: "Tasks Completed" },
  { value: "12", label: "Projects Listed" },
];

export function StatsBar() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card px-4 py-5 text-center"
          >
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
