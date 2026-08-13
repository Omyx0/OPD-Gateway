import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Clock, LayoutGrid, List, Stethoscope, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AsyncSection, StateDemoBar, useMockLoad } from "@/components/common/AsyncSection";
import { useStaffStore } from "@/state/staff-store";
import { staffService, type DepartmentSnapshot } from "@/services";

export const Route = createFileRoute("/staff/departments")({
  head: () => ({
    meta: [
      { title: "Department View — Smart OPD Staff" },
      {
        name: "description",
        content:
          "Configurable department cards showing waiting patients, triage mix, average wait and clinic capacity across OPD departments.",
      },
      { property: "og:title", content: "Department View — Smart OPD Staff" },
      {
        property: "og:description",
        content: "Waiting patients, triage mix and capacity per OPD department.",
      },
    ],
  }),
  component: DepartmentsPage,
});

function TriageMix({ d }: { d: DepartmentSnapshot }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs font-medium">
      <span className="rounded-full border border-emergency/50 bg-emergency-soft px-2 py-0.5 text-emergency">
        {d.emergency} emergency
      </span>
      <span className="rounded-full border border-priority/50 bg-priority-soft px-2 py-0.5 text-priority-soft-foreground">
        {d.priority} priority
      </span>
      <span className="rounded-full border border-routine/50 bg-routine-soft px-2 py-0.5 text-routine-soft-foreground">
        {d.routine} routine
      </span>
    </div>
  );
}

function DepartmentsPage() {
  const { queue, setDepartmentFilter } = useStaffStore();
  const navigate = useNavigate();
  const [view, setView] = useState<"cards" | "list">("cards");
  const snapshots = staffService.getDepartmentSnapshots(queue);
  const busiest = Math.max(1, ...snapshots.map((d) => d.waiting));
  const { phase, setPhase, reload } = useMockLoad();

  const openQueue = (name: string) => {
    setDepartmentFilter(name);
    navigate({ to: "/staff/queue" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
          <p className="text-sm text-muted-foreground">
            {snapshots.length} configured departments · counts derived from the current mock queue
          </p>
        </div>
        <StateDemoBar phase={phase} onChange={setPhase} />
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <Button
            variant={view === "cards" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("cards")}
            aria-pressed={view === "cards"}
          >
            <LayoutGrid aria-hidden />
            Cards
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
          >
            <List aria-hidden />
            List
          </Button>
        </div>
      </div>

      <AsyncSection
        phase={phase}
        loadingLabel="Loading departments"
        errorTitle="Departments didn't load"
        errorDescription="We couldn't load department configuration. Try again."
        onRetry={reload}
        isEmpty={snapshots.length === 0}
        emptyTitle="No departments configured"
        emptyDescription="Add departments to see live load and walk-in status here."
      >
        {view === "cards" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshots.map((d) => (
              <Card key={d.id} className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.code} · {d.location}
                    </p>
                  </div>
                  <span
                    className={
                      d.acceptingWalkIns
                        ? "rounded-full border border-routine/50 bg-routine-soft px-2 py-0.5 text-xs font-medium text-routine-soft-foreground"
                        : "rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {d.acceptingWalkIns ? "Walk-ins open" : "By referral"}
                  </span>
                </div>

                <Separator className="my-3" />

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">{d.waiting}</p>
                    <p className="text-xs text-muted-foreground">Waiting</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">{d.averageWaitMinutes}m</p>
                    <p className="text-xs text-muted-foreground">Avg wait</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">{d.longestWaitMinutes}m</p>
                    <p className="text-xs text-muted-foreground">Longest</p>
                  </div>
                </div>

                <Progress
                  className="mt-3"
                  value={(d.waiting / busiest) * 100}
                  aria-label={`${d.name}: ${d.waiting} patients waiting`}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Target wait {d.targetWaitMinutes}m ·{" "}
                  {d.averageWaitMinutes > d.targetWaitMinutes ? "above target" : "within target"}
                </p>

                <div className="mt-3">
                  <TriageMix d={d} />
                </div>

                <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="size-3.5" aria-hidden />
                    <dt className="sr-only">Clinicians on duty</dt>
                    <dd>
                      {d.cliniciansOnDuty} clinicians · {d.consultingRooms} rooms
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5" aria-hidden />
                    <dt className="sr-only">Hours</dt>
                    <dd>{d.hours}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-3.5" aria-hidden />
                    <dt className="sr-only">Throughput</dt>
                    <dd>
                      {d.inProgress} in progress · {d.completed} completed today
                    </dd>
                  </div>
                </dl>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 self-start"
                  onClick={() => openQueue(d.name)}
                >
                  <Building2 aria-hidden />
                  View queue
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Waiting</TableHead>
                  <TableHead className="text-right">Avg wait</TableHead>
                  <TableHead className="text-right">Longest</TableHead>
                  <TableHead>Triage mix</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.location}</TableCell>
                    <TableCell className="text-right tabular-nums">{d.waiting}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {d.averageWaitMinutes}m
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {d.longestWaitMinutes}m
                    </TableCell>
                    <TableCell>
                      <TriageMix d={d} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.cliniciansOnDuty} clinicians · {d.consultingRooms} rooms
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openQueue(d.name)}>
                        View queue
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </AsyncSection>
    </div>
  );
}
