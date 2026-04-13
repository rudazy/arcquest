const LEVEL_COLORS: Record<number, string> = {
  1: "text-zinc-400",
  2: "text-blue-400",
  3: "text-green-400",
  4: "text-purple-400",
  5: "text-yellow-400",
};

export function getLevelColor(level: number): string {
  return LEVEL_COLORS[level] ?? "text-zinc-400";
}
