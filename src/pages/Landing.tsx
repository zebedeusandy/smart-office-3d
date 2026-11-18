import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CalendarClock,
  LayoutDashboard,
  Layers3,
  LibraryBig,
  MapPin,
  MessagesSquare,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useOfficeSnapshot } from "@/hooks/use-office-data";
import { occupantsOfRoom } from "@/services/office-service";

const signInHref = "/auth?returnTo=%2Fdashboard";
const floorHref = "/auth?returnTo=%2Foffice";
const catalogHref = "/auth?returnTo=%2Fcatalog";

const features = [
  {
    icon: MessagesSquare,
    title: "A feed the team actually uses",
    body: "Post updates, ask questions and upload images. Comments and reactions keep the context next to the conversation.",
  },
  {
    icon: LibraryBig,
    title: "One searchable catalog",
    body: "Playbooks, templates, automations and shared equipment, each with an owner, tags and a detail page worth linking to.",
  },
  {
    icon: CalendarClock,
    title: "Bookings that hold up",
    body: "Reserve a room and a time block in seconds. Overlapping requests are rejected before they reach the schedule.",
  },
  {
    icon: ShieldCheck,
    title: "An admin area that earns its name",
    body: "Moderate posts, maintain the catalog, cancel bookings and check the team from a single operations screen.",
  },
  {
    icon: Boxes,
    title: "The office, in three dimensions",
    body: "An interactive isometric floor shows who is in, where they sit and which rooms have space right now.",
  },
  {
    icon: LayoutDashboard,
    title: "A dashboard that is yours",
    body: "Your bookings, the latest team posts and the floor metrics that matter, together on one page when you sign in.",
  },
];

const steps = [
  {
    number: "01",
    title: "Sign in with your work email",
    body: "A one-time code gets you into the shared workspace. No separate account setup, no password to forget.",
  },
  {
    number: "02",
    title: "Share, ask and find",
    body: "Post to the team feed, then search the catalog for the playbook or template that already answers the question.",
  },
  {
    number: "03",
    title: "Book the room and manage it",
    body: "Reserve a space for the follow-up, and keep the whole workspace tidy from the admin area.",
  },
];

const stack = [
  "React 19",
  "TypeScript",
  "Three.js",
  "React Three Fiber",
  "Tailwind CSS",
  "Recharts",
  "Convex",
];

function HeroFloor() {
  const { data, loading } = useOfficeSnapshot();
  const rooms = data?.rooms ?? [];
  const inOffice = data?.employees.filter(
    (employee) => employee.presence === "in-office",
  );
  const onSite = inOffice?.length ?? 0;
  const total = data?.employees.length ?? 0;
  const deskOccupant = data?.employees.find(
    (employee) => employee.location.roomId && employee.location.seatIndex !== null,
  );

  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/15 blur-[110px]" />
      <div className="relative h-[380px] overflow-hidden sm:h-[440px]">
        <div className="absolute inset-0 flex items-center justify-center [perspective:1500px]">
          <div className="scale-[0.62] sm:scale-[0.82] lg:scale-100">
            <div className="iso-stage grid w-[540px] shrink-0 grid-cols-3 gap-3">
              {loading
                ? Array.from({ length: 9 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[132px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
                    />
                  ))
                : rooms.map((room) => {
                    const occupants = data
                      ? occupantsOfRoom(data.employees, room.id)
                      : [];
                    return (
                      <Link
                        key={room.id}
                        to={`/auth?returnTo=${encodeURIComponent(`/office?room=${room.id}`)}`}
                        title={`${room.name} · ${occupants.length}/${room.capacity} seats`}
                        className="iso-tile group relative h-[132px] overflow-hidden rounded-2xl border bg-[#081726]/90 p-3"
                        style={{
                          borderColor: `${room.accent}44`,
                          boxShadow: `inset 0 0 30px -12px ${room.accent}66`,
                        }}
                      >
                        <span
                          className="absolute inset-x-0 top-0 h-[3px]"
                          style={{ backgroundColor: room.accent }}
                        />
                        <div className="flex items-start justify-between">
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: room.accent,
                              boxShadow: `0 0 12px ${room.accent}`,
                            }}
                          />
                          <span className="font-display text-[10px] tabular-nums text-white/70">
                            {occupants.length}/{room.capacity}
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-1.5">
                          {Array.from({ length: 4 }).map((_, desk) => (
                            <span
                              key={desk}
                              className="h-2.5 rounded-[3px] border border-white/10"
                              style={{
                                backgroundColor:
                                  desk < Math.min(occupants.length, 4)
                                    ? `${room.accent}66`
                                    : "rgba(255,255,255,0.04)",
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="absolute inset-x-3 bottom-2.5 h-[3px] rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${room.accent}aa, transparent)`,
                          }}
                        />
                        <span className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
                      </Link>
                    );
                  })}
              <Link
                to={floorHref}
                className="iso-tile relative h-[132px] overflow-hidden rounded-2xl border border-emerald-300/30 bg-[#04170f]/90 p-3"
              >
                <span className="absolute inset-x-0 top-0 h-[3px] bg-emerald-400" />
                <div className="flex items-start justify-between">
                  <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
                  <Sparkles className="size-3 text-emerald-300/70" />
                </div>
                <div className="mt-5 flex items-end gap-1.5">
                  {[10, 18, 12, 22, 16].map((height, index) => (
                    <span
                      key={index}
                      className="w-2 rounded-t-sm bg-emerald-400/40"
                      style={{ height }}
                    />
                  ))}
                </div>
                <span className="absolute inset-x-3 bottom-2.5 h-[3px] rounded-full bg-gradient-to-r from-emerald-400/80 to-transparent" />
              </Link>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050c18] to-transparent" />
      </div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glass-panel absolute -left-2 top-6 w-[168px] rounded-xl p-3 sm:-left-4"
      >
        <p className="flex items-center gap-1.5 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
          <span className="size-1.5 rounded-full bg-emerald-400 pulse-dot" />
          On the floor
        </p>
        <p className="mt-2 font-display text-xl font-semibold text-white">
          {loading ? "—" : `${onSite}/${total}`}
          <span className="ml-1 text-[10px] font-normal text-muted-foreground">
            on site
          </span>
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            style={{
              width: loading
                ? "0%"
                : `${Math.round((onSite / Math.max(total, 1)) * 100)}%`,
            }}
          />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="glass-panel absolute -right-1 top-24 rounded-xl p-3 sm:-right-4"
      >
        <p className="text-[8.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          At their desk
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="grid size-6 place-items-center rounded-full text-[8px] font-bold text-[#06101f]"
            style={{ backgroundColor: deskOccupant?.accent ?? "#22d3ee" }}
          >
            {deskOccupant?.initials ?? "HA"}
          </span>
          <div>
            <p className="text-[10px] font-medium text-white">
              {deskOccupant?.name ?? "Awaiting floor data"}
            </p>
            <p className="text-[8px] text-muted-foreground">
              {deskOccupant?.role ?? "Team directory"}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="glass-panel absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5"
      >
        <p className="flex items-center gap-2 text-[9px] text-slate-300">
          <span className="font-mono text-cyan-300">
            {rooms.length > 0 ? rooms.length : 8} rooms
          </span>
          <span className="text-white/20">·</span>
          <span>orthographic 3D</span>
          <span className="text-white/20">·</span>
          <span className="text-emerald-300">live team presence</span>
        </p>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050c18] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(800px_500px_at_15%_-5%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(900px_600px_at_88%_8%,rgba(59,130,246,0.18),transparent_62%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 grid-blueprint opacity-[0.22]" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#050c18]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Hub Agent Net home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-[11px] font-medium text-slate-400 md:flex">
            <a href="#workspace" className="transition-colors hover:text-white">
              The workspace
            </a>
            <a href="#workflow" className="transition-colors hover:text-white">
              How it works
            </a>
            <a href="#stack" className="transition-colors hover:text-white">
              Under the hood
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to={signInHref}
              className="rounded-xl px-3 py-2 text-[11px] font-medium text-slate-300 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to={signInHref}
              className="group flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 px-3.5 py-2 text-[11px] font-semibold text-[#04101f] shadow-[0_16px_40px_-20px_rgba(34,211,238,0.9)] transition-opacity hover:opacity-90"
            >
              Enter the hub
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/[0.07] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-200"
            >
              <Sparkles className="size-3" />
              Internal workspace · For your team
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 max-w-xl font-display text-[38px] font-semibold leading-[1.06] tracking-tight sm:text-[52px] lg:text-[56px]"
            >
              One hub for the work
              <br />
              <span className="text-gradient-cyan">behind the work.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 max-w-lg text-[13px] leading-relaxed text-slate-400 sm:text-sm"
            >
              Hub Agent Net keeps your team's updates, resources, room bookings
              and office floor in one private place — so nobody has to dig
              through a chat thread to find the answer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-7 flex flex-wrap items-center gap-2.5"
            >
              <Link
                to={signInHref}
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 py-2.5 text-xs font-semibold text-[#04101f] shadow-[0_20px_50px_-22px_rgba(34,211,238,0.95)] transition-opacity hover:opacity-90"
              >
                <Users className="size-4" />
                Sign in to the hub
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to={catalogHref}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-300/30 hover:bg-white/[0.06]"
              >
                Browse the catalog
                <ArrowUpRight className="size-3.5 text-cyan-300" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <MessagesSquare className="size-3.5 text-cyan-300/80" />
                Posts, comments and uploads
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-cyan-300/80" />
                Room bookings
              </span>
              <span className="flex items-center gap-1.5">
                <Layers3 className="size-3.5 text-cyan-300/80" />
                Admin controls
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <HeroFloor />
          </motion.div>
        </section>

        <section id="workspace" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-3 border-t border-white/[0.07] pt-10 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                Inside the hub
              </p>
              <h2 className="mt-2 max-w-xl font-display text-2xl font-semibold sm:text-[32px]">
                Six things your team stops chasing.
              </h2>
            </div>
            <p className="max-w-sm text-[11.5px] leading-relaxed text-muted-foreground">
              Everything is private to your workspace and built around the way a
              small team actually works: share it, find it, book it, keep it tidy.
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-cyan-300/20 hover:bg-white/[0.04]"
              >
                <span className="grid size-9 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-400/[0.08] text-cyan-300">
                  <feature.icon className="size-4" />
                </span>
                <h3 className="mt-3 text-[13px] font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6 lg:px-8">
          <div className="glass-panel overflow-hidden rounded-3xl">
            <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                  How it works
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-[30px]">
                  The team day, without the archaeology.
                </h2>
                <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
                  Sign in once and the whole workspace is in the sidebar. Post an
                  update, find the playbook, reserve the room, then clear the
                  schedule from admin.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Feed", "Catalog", "Bookings", "3D floor", "Admin"].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9.5px] text-slate-300"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <span className="font-display text-[11px] font-semibold text-cyan-300/70">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="text-[12.5px] font-semibold text-white">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="stack" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                <Radio className="size-3.5" />
                Under the hood
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold sm:text-2xl">
                A working prototype your team can start using today.
              </h2>
              <p className="mt-2 max-w-xl text-[11.5px] leading-relaxed text-muted-foreground">
                Posts, catalog entries and bookings persist in the browser for
                this internal build. The data lives behind service interfaces, so
                moving it to a shared backend is an adapter change rather than a
                rewrite.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-white/[0.08] bg-[#0a1526] px-2 py-1 font-mono text-[9px] text-slate-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:w-[300px]">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                <MessagesSquare className="size-4 text-cyan-300" />
                <p className="mt-2 text-[10px] font-medium text-slate-200">
                  Team-managed
                </p>
                <p className="mt-0.5 text-[9.5px] leading-relaxed text-muted-foreground">
                  Content, catalog and admin in one place.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                <ShieldCheck className="size-4 text-emerald-300" />
                <p className="mt-2 text-[10px] font-medium text-slate-200">
                  Private by default
                </p>
                <p className="mt-0.5 text-[9.5px] leading-relaxed text-muted-foreground">
                  Every screen sits behind team sign-in.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-400/[0.12] via-blue-500/[0.06] to-transparent p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute left-1/2 top-0 h-[220px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[100px]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
              Your team is already in
            </p>
            <h2 className="mx-auto mt-3 max-w-xl font-display text-2xl font-semibold sm:text-[34px]">
              Step into the hub.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[12px] leading-relaxed text-slate-400">
              Use your work email or continue as a guest to explore the feed, the
              catalog, the room schedule and the 3D floor.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Link
                to={signInHref}
                className="group flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-[#06101f] transition-opacity hover:opacity-90"
              >
                Sign in to Hub Agent Net
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to={floorHref}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/[0.08]"
              >
                Open the 3D floor
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-[10px] text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Logo compact />
            <span>HUB AGENT NET · Internal workspace</span>
          </div>
          <p>React · Three.js · Convex · Built for the team</p>
        </div>
      </footer>
    </div>
  );
}
