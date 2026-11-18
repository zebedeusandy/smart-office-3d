import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-300/80">
          <span className="size-1.5 rounded-full bg-cyan-300 pulse-dot" />
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-white sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
          {description}
        </p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
