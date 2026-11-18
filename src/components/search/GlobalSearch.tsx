import { useNavigate } from "react-router";
import { ArrowUpRight, Building2, LayoutDashboard, Boxes } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { STATUS_META } from "@/lib/office-layout";
import { roomKindLabel } from "@/services/office-service";
import type { Employee, Room } from "@/types/office";

export function GlobalSearch({
  open,
  onOpenChange,
  rooms,
  employees,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: Room[];
  employees: Employee[];
}) {
  const navigate = useNavigate();

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Nexus OS"
      description="Find a room, a colleague or a screen."
      className="glass-panel border-white/10 sm:max-w-xl"
    >
      <CommandInput placeholder="Search rooms, people or pages…" />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>No matches. Try a room name or colleague.</CommandEmpty>

        <CommandGroup heading="Workspace">
          <CommandItem value="dashboard overview metrics" onSelect={() => go("/dashboard")}>
            <LayoutDashboard className="size-4 text-cyan-300" />
            Dashboard
            <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
              metrics
            </span>
          </CommandItem>
          <CommandItem value="3d office floor plan isometric" onSelect={() => go("/office")}>
            <Boxes className="size-4 text-cyan-300" />
            3D Office
            <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
              live floor
            </span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Rooms">
          {rooms.map((room) => (
            <CommandItem
              key={room.id}
              value={`${room.name} ${room.kind} room`}
              onSelect={() => go(`/office?room=${room.id}`)}
            >
              <Building2 className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate">{room.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {roomKindLabel(room.kind)}
              </span>
              <ArrowUpRight className="size-3.5 text-muted-foreground/70" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="People">
          {employees.map((employee) => {
            const status = STATUS_META[employee.status];
            return (
              <CommandItem
                key={employee.id}
                value={`${employee.name} ${employee.role} ${employee.department}`}
                onSelect={() => go(`/office?employee=${employee.id}`)}
              >
                <span
                  className="grid size-6 place-items-center rounded-full text-[9px] font-semibold text-[#06101f]"
                  style={{ backgroundColor: employee.accent }}
                >
                  {employee.initials}
                </span>
                <span className="flex-1 truncate">
                  {employee.name}
                  <span className="ml-2 text-[11px] text-muted-foreground">{employee.role}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  {status.label}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
