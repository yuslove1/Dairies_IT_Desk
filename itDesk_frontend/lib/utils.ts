// Simple cn() utility — merges class strings (no clsx dependency needed)
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
