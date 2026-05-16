import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Show amber left-border accent (for priority sections) */
  accent?: boolean;
}

export function Card({ children, className, accent }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-lg border border-border shadow-card p-5",
        accent && "border-l-2 border-l-accent",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionLabel({
  children,
  mono,
  className,
}: {
  children: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[10px] font-semibold tracking-widest uppercase text-ink-3 mb-3",
        mono ? "font-mono" : "font-sans",
        className
      )}
    >
      {children}
    </p>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-border-light", className)} />;
}
