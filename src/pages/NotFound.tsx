import { Link } from "react-router";
import { ArrowLeft, Boxes } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#050c18] px-6 text-white">
      <div className="pointer-events-none absolute inset-0 grid-blueprint opacity-25" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[110px]" />
      <div className="relative w-full max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-8 font-display text-[64px] font-semibold leading-none text-gradient-cyan">
          404
        </p>
        <h1 className="mt-2 font-display text-xl font-semibold">
          This page is not in the hub
        </h1>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          The link may be out of date. Head back to your dashboard, browse the
          catalog, or open the 3D office instead.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 py-2.5 text-[11px] font-semibold text-[#04101f] transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="size-3.5" />
            Back to dashboard
          </Link>
          <Link
            to="/catalog"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[11px] font-medium text-slate-200 transition-colors hover:bg-white/[0.07]"
          >
            <Boxes className="size-3.5 text-cyan-300" />
            Browse the catalog
          </Link>
        </div>
      </div>
    </main>
  );
}
