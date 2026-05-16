/** Minimal classname merge utility — avoids pulling in clsx just for this. */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
