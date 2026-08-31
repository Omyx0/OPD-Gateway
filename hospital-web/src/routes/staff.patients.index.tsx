import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AsyncSection, StateDemoBar, useMockLoad } from "@/components/common/AsyncSection";
import { useStaffAuth } from "@/state/staff-auth";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/api";
import { staffService } from "@/services";
import type { Priority, QueueStatus } from "@/services";

const DEPARTMENT_DIRECTORY = staffService.listDepartments();

const STATUSES: QueueStatus[] = ["WAITING", "CALLED", "IN_PROGRESS", "COMPLETED", "SKIPPED"];
const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "RED", label: "Emergency" },
  { value: "YELLOW", label: "Priority" },
  { value: "GREEN", label: "Routine" },
];

export const Route = createFileRoute("/staff/patients/")({
  head: () => ({
    meta: [
      { title: "Patient List — Smart OPD Staff" },
      {
        name: "description",
        content:
          "Search and filter today's OPD patients by department, triage priority and queue status.",
      },
      { property: "og:title", content: "Patient List — Smart OPD Staff" },
      {
        property: "og:description",
        content: "Filter OPD patients by department, priority and status.",
      },
    ],
  }),
  component: PatientListPage,
});

function PatientListPage() {
  const { user } = useStaffAuth();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [department, setDepartment] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const { phase, setPhase, reload } = useMockLoad();

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ["queue"],
    queryFn: async () => {
      if (!user?.token) return [];
      const res = await fetch(`${API_URL}/queue`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch queue");
      const { data } = await res.json();
      return data.map((d: any) => {
        const dob = d.visits?.patients?.date_of_birth;
        const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000) : null;
        return {
          id: d.id,
          token: d.token,
          priority: d.priority,
          status: d.status,
          waitMinutes: Math.round((Date.now() - new Date(d.arrival_time).getTime()) / 60000),
          department: d.departments?.name ?? 'General',
          patient: {
            name: d.visits?.patients?.full_name ?? 'Unknown',
            age: age ?? '-',
            gender: d.visits?.patients?.gender ?? '-',
            phone: d.visits?.patients?.mobile ?? ''
          }
        };
      });
    },
    refetchInterval: 5000
  });

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    return queue.filter((e) => {
      const matchesTerm =
        !q ||
        e.patient.name.toLowerCase().includes(q) ||
        e.token.toLowerCase().includes(q) ||
        e.patient.phone.toLowerCase().includes(q);
      return (
        matchesTerm &&
        (department === "all" || e.department === department) &&
        (priority === "all" || e.priority === priority) &&
        (status === "all" || e.status === status)
      );
    });
  }, [queue, term, department, priority, status]);

  const filtered = term || department !== "all" || priority !== "all" || status !== "all";

  const reset = () => {
    setTerm("");
    setDepartment("all");
    setPriority("all");
    setStatus("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground">
            {results.length} of {queue.length} records
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/staff/patients/new" })} className="rounded-full bg-teal-600 hover:bg-teal-700 text-white">
          + Register New Patient
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="pl-9"
            placeholder="Search name, token or mobile"
            aria-label="Search patients"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>

        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[190px]" aria-label="Filter by department">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPARTMENT_DIRECTORY.map((d) => (
              <SelectItem key={d.id} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ").toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filtered ? (
          <Button variant="ghost" size="sm" onClick={reset}>
            <X aria-hidden />
            Clear
          </Button>
        ) : null}

        <StateDemoBar phase={phase} onChange={setPhase} className="ml-auto" />
      </div>

      <AsyncSection
        phase={phase}
        loadingLabel="Loading patients"
        skeleton="table"
        errorTitle="Patient list didn't load"
        errorDescription="We couldn't refresh the patient list. Records are unchanged — try again."
        onRetry={reload}
        isEmpty={results.length === 0}
        emptyTitle="No patients found."
        emptyDescription="No records match this search or these filters."
        {...(filtered ? { emptyActionLabel: "Clear filters", onEmptyAction: reset } : {})}
      >
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableCaption className="sr-only">
              Patient records. Each row opens the full patient detail page.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Token</TableHead>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Department</TableHead>
                <TableHead scope="col">Priority</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">
                  Waiting time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((e) => (
                <TableRow
                  key={e.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`Open patient record for ${e.patient.name}, token ${e.token}`}
                  className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                  onClick={() =>
                    navigate({ to: "/staff/patients/$patientId", params: { patientId: e.id } })
                  }
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      navigate({ to: "/staff/patients/$patientId", params: { patientId: e.id } });
                    }
                  }}
                >
                  <TableCell className="font-semibold tabular-nums">{e.token}</TableCell>
                  <TableCell>
                    <span className="block font-medium">{e.patient.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {e.patient.age} yrs · {e.patient.gender}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{e.department}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={e.priority} variant="soft" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={e.status} />
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {e.waitMinutes}m
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncSection>
    </div>
  );
}
