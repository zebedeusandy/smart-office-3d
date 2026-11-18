import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Check,
  Copy,
  LibraryBig,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { useHubData } from "@/hooks/use-hub-data";
import {
  CATEGORY_META,
  formatRelative,
} from "@/lib/hub-utils";
import { cn } from "@/lib/utils";

export default function CatalogItemPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { data, loading } = useHubData();
  const [copied, setCopied] = useState(false);

  const item = data?.catalog.find((entry) => entry.id === itemId);
  const related =
    data?.catalog
      .filter((entry) => entry.id !== itemId && entry.category === item?.category)
      .slice(0, 3) ?? [];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Your browser blocked clipboard access.");
    }
  };

  if (!item && loading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-white/5" />
          <div className="h-[260px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-52 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025] lg:col-span-2" />
            <div className="h-52 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="glass-panel mx-auto mt-10 flex max-w-md flex-col items-center gap-2 rounded-2xl px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <LibraryBig className="size-5" />
          </span>
          <p className="font-display text-base font-semibold text-white">
            That resource is not in the catalog
          </p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            It may have been removed, or the link might be out of date.
          </p>
          <Link
            to="/catalog"
            className="mt-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 py-2 text-[11px] font-semibold text-[#04101f]"
          >
            <ArrowLeft className="size-3.5" />
            Back to catalog
          </Link>
        </div>
      </AppLayout>
    );
  }

  const meta = CATEGORY_META[item.category];

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/catalog"
            className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Back to catalog
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-slate-300 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-300" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-slate-300 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              <ShieldCheck className="size-3.5 text-cyan-300" />
              Manage
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a1526] p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full opacity-20 blur-[80px]"
            style={{ backgroundColor: meta.accent }}
          />
          <div className="pointer-events-none absolute inset-0 grid-blueprint opacity-[0.18]" />

          <div className="relative max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9.5px] font-medium",
                  meta.className,
                )}
              >
                <meta.icon className="size-3" />
                {meta.label}
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[9.5px] text-slate-300">
                {item.format}
              </span>
              <span className="text-[9.5px] text-muted-foreground">
                Updated {formatRelative(item.updatedAt)}
              </span>
            </div>

            <h1 className="mt-4 font-display text-[28px] font-semibold leading-tight text-white sm:text-[36px]">
              {item.name}
            </h1>
            <p className="mt-3 max-w-2xl text-[12.5px] leading-relaxed text-slate-300">
              {item.summary}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[9px] text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="glass-panel rounded-2xl p-5 sm:p-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              About this resource
            </p>
            <div className="mt-3 space-y-3">
              {item.description.split("\n\n").map((paragraph, index) => (
                <p
                  key={index}
                  className="text-[12px] leading-[1.75] text-slate-300"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-5 grid gap-2 border-t border-white/[0.06] pt-4 sm:grid-cols-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Owner
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-200">
                  <UserRound className="size-3 text-cyan-300/80" />
                  {item.owner}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Format
                </p>
                <p className="mt-1 text-[11px] text-slate-200">{item.format}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  Last updated
                </p>
                <p className="mt-1 text-[11px] text-slate-200">
                  {new Date(item.updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                Put this to work
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Walk the team through it in a room, or ask the owner for a
                working session.
              </p>
              <Link
                to={`/bookings?title=${encodeURIComponent(`Walkthrough: ${item.name}`)}&note=${encodeURIComponent(`Catalog walkthrough with ${item.owner}.`)}`}
                className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 text-[11px] font-semibold text-[#04101f] transition-opacity hover:opacity-90"
              >
                <CalendarClock className="size-3.5" />
                Book a walkthrough
              </Link>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-[9.5px] text-muted-foreground">
                <ShieldCheck className="size-3 text-emerald-300" />
                Internal resource · team access
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                  Related
                </p>
                <Link
                  to="/catalog"
                  className="text-[9.5px] text-muted-foreground hover:text-white"
                >
                  All
                </Link>
              </div>
              <div className="mt-3 space-y-2">
                {related.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    Nothing else in this category yet.
                  </p>
                )}
                {related.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/catalog/${entry.id}`}
                    className="group flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2 transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10.5px] font-medium text-slate-200">
                        {entry.name}
                      </span>
                      <span className="block truncate text-[9px] text-muted-foreground">
                        {entry.owner}
                      </span>
                    </span>
                    <ArrowUpRight className="size-3 text-muted-foreground/60 group-hover:text-cyan-200" />
                  </Link>
                ))}
              </div>
              <Link
                to="/catalog"
                className="mt-3 flex items-center gap-1 text-[10px] font-medium text-cyan-300 hover:text-cyan-200"
              >
                Back to the catalog
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
