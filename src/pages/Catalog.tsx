import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  LibraryBig,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/hub/PageHeader";
import { useHubData } from "@/hooks/use-hub-data";
import {
  CATALOG_CATEGORIES,
  CATEGORY_META,
  formatRelative,
} from "@/lib/hub-utils";
import type { CatalogCategory } from "@/types/hub";
import { cn } from "@/lib/utils";

export default function Catalog() {
  const { data, loading } = useHubData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CatalogCategory>("all");

  const catalog = data?.catalog ?? [];
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return catalog.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.summary.toLowerCase().includes(search) ||
        item.owner.toLowerCase().includes(search) ||
        item.tags.some((tag) => tag.toLowerCase().includes(search));
      return matchesCategory && matchesSearch;
    });
  }, [catalog, category, query]);

  return (
    <AppLayout>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Catalog"
          title="Everything the team has already figured out"
          description="Playbooks, templates, automations and shared equipment. Search by name, owner or tag, then open an item for the full detail."
          actions={
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[11px] font-medium text-slate-200 transition-colors hover:border-cyan-300/30 hover:bg-white/[0.06]"
            >
              <SlidersHorizontal className="size-3.5 text-cyan-300" />
              Manage catalog
            </Link>
          }
        />

        <div className="glass-panel rounded-2xl p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search playbooks, templates, owners or tags…"
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-9 text-[12px] text-white outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-cyan-300/40 focus:bg-white/[0.05]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[10px] font-medium transition-colors",
                  category === "all"
                    ? "border-cyan-300/35 bg-cyan-400/10 text-cyan-100"
                    : "border-white/[0.07] bg-white/[0.02] text-muted-foreground hover:text-slate-200",
                )}
              >
                All items
              </button>
              {CATALOG_CATEGORIES.map((key) => {
                const meta = CATEGORY_META[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium transition-colors",
                      category === key
                        ? meta.className
                        : "border-white/[0.07] bg-white/[0.02] text-muted-foreground hover:text-slate-200",
                    )}
                  >
                    <meta.icon className="size-3" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[10px] text-muted-foreground">
            <span>
              {filtered.length} of {catalog.length} resources
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Maintained by the team
            </span>
          </div>
        </div>

        {loading && !data ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[210px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel flex flex-col items-center gap-2 rounded-2xl px-6 py-16 text-center">
            <span className="grid size-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <LibraryBig className="size-5" />
            </span>
            <p className="font-display text-sm font-semibold text-white">
              No matching resources
            </p>
            <p className="max-w-xs text-[11px] leading-relaxed text-muted-foreground">
              Try a broader search, or add a new item from the admin area.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-1 text-[10px] font-medium text-cyan-300 hover:text-cyan-200"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => {
              const meta = CATEGORY_META[item.category];
              return (
                <Link
                  key={item.id}
                  to={`/catalog/${item.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.04] hover:shadow-[0_24px_60px_-34px_rgba(34,211,238,0.45)]"
                >
                  <div
                    className="pointer-events-none absolute -right-10 -top-12 size-28 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-35"
                    style={{ backgroundColor: meta.accent }}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="grid size-9 place-items-center rounded-xl border border-white/10"
                      style={{ backgroundColor: `${meta.accent}18`, color: meta.accent }}
                    >
                      <meta.icon className="size-4" />
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[9px] font-medium",
                        meta.className,
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <h2 className="mt-3 font-display text-[14px] font-semibold leading-snug text-white">
                    {item.name}
                  </h2>
                  <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 text-[8.5px] text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
                    <span className="min-w-0 truncate text-[9.5px] text-muted-foreground">
                      {item.owner} · {formatRelative(item.updatedAt)}
                    </span>
                    <span className="flex items-center gap-1 text-[9.5px] font-medium text-cyan-300/80 transition-colors group-hover:text-cyan-200">
                      Open
                      <ArrowUpRight className="size-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[10px] text-muted-foreground">
          <span>Missing something? Ask in the team feed or add it from admin.</span>
          <Link
            to="/feed"
            className="flex shrink-0 items-center gap-1 font-medium text-cyan-300 hover:text-cyan-200"
          >
            Open feed
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
