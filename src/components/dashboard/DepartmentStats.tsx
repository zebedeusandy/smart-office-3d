import type { DashboardStats, DepartmentSummary } from "@/types/office";

export function DepartmentStats({
  departments,
  stats,
}: {
  departments: DepartmentSummary[];
  stats: DashboardStats;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4">
        <div
          className="relative grid size-[74px] shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#22d3ee ${stats.occupancyRate}%, rgba(255,255,255,0.07) 0)`,
            boxShadow: "0 0 30px -10px rgba(34,211,238,0.55)",
          }}
        >
          <div className="grid size-[60px] place-items-center rounded-full bg-[#0b1527]">
            <div className="text-center">
              <p className="font-display text-lg font-semibold leading-none text-white">
                {stats.occupancyRate}%
              </p>
              <p className="mt-0.5 text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
                Seated
              </p>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-200">
            {stats.presentToday} of {stats.totalEmployees} on site
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {stats.remoteToday} remote · {stats.absentToday} away
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-cyan-300/80">
            {stats.availableRooms} spaces with free seats
          </p>
        </div>
      </div>

      <div className="scrollbar-thin mt-5 flex-1 space-y-3.5 overflow-y-auto pr-1">
        {departments.map((department) => (
          <div key={department.id}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[11px] text-slate-300">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: department.color }}
                />
                {department.name}
              </span>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {department.headcount} people
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${department.occupancy}%`,
                  background: `linear-gradient(90deg, ${department.color}66, ${department.color})`,
                  boxShadow: `0 0 10px ${department.color}55`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
