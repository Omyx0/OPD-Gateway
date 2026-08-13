import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, CheckCircle2, Clock, Gauge, Timer, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AsyncSection, StateDemoBar, useMockLoad } from "@/components/common/AsyncSection";
import { StatCard } from "@/components/common/StatCard";
import { staffService } from "@/services";

const MOCK_HOURLY_FLOW = staffService.getHourlyThroughput();
import { useStaffStore } from "@/state/staff-store";

export const Route = createFileRoute("/staff/analytics")({
  head: () => ({
    meta: [
      { title: "OPD Analytics — Smart OPD Staff" },
      {
        name: "description",
        content:
          "Waiting times, triage mix, department load, completed visits and queue throughput for the OPD.",
      },
      { property: "og:title", content: "OPD Analytics — Smart OPD Staff" },
      {
        property: "og:description",
        content: "Waiting times, triage mix, department load and queue throughput for the OPD.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const TOOLTIP = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
} as const;

function AnalyticsPage() {
  const { queue, alerts } = useStaffStore();
  const { phase, setPhase, reload } = useMockLoad();

  const waits = queue.map((e) => e.waitMinutes);
  const total = queue.length;
  const avgWait = total ? Math.round(waits.reduce((a, b) => a + b, 0) / total) : 0;
  const maxWait = total ? Math.max(...waits) : 0;
  const completed = queue.filter((e) => e.status === "COMPLETED").length;
  const openAlerts = alerts.filter((a) => !a.acknowledged).length;
  const throughputPerHour = MOCK_HOURLY_FLOW.length
    ? Math.round(MOCK_HOURLY_FLOW.reduce((a, b) => a + b.patients, 0) / MOCK_HOURLY_FLOW.length)
    : 0;

  const priorityData = [
    {
      name: "Emergency",
      value: queue.filter((e) => e.priority === "RED").length,
      fill: "var(--emergency)",
    },
    {
      name: "Priority",
      value: queue.filter((e) => e.priority === "YELLOW").length,
      fill: "var(--priority)",
    },
    {
      name: "Routine",
      value: queue.filter((e) => e.priority === "GREEN").length,
      fill: "var(--routine)",
    },
  ];

  const departmentData = staffService
    .getDepartmentSnapshots(queue)
    .map((d) => ({
      name: d.name,
      patients: queue.filter((e) => e.department === d.name).length,
      averageWaitMinutes: d.averageWaitMinutes,
    }))
    .filter((d) => d.patients > 0);

  const throughputData = MOCK_HOURLY_FLOW.map((h, i) => ({
    hour: h.hour,
    arrived: h.patients,
    completed: Math.max(0, h.patients - (i % 3) - 2),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Mock operational figures derived from the current demo queue.
          </p>
        </div>
        <StateDemoBar phase={phase} onChange={setPhase} />
      </div>

      <AsyncSection
        phase={phase}
        loadingLabel="Calculating today's figures"
        errorTitle="Analytics didn't load"
        errorDescription="We couldn't calculate today's figures. Try again in a moment."
        onRetry={reload}
        emptyTitle="No visits recorded yet"
        emptyDescription="Figures appear once patients have been registered today."
      >
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard label="Total patients" value={total} icon={Users} tone="brand" />
          <StatCard
            label="Average waiting time"
            value={`${avgWait}m`}
            icon={Clock}
            hint="Across all departments"
          />
          <StatCard
            label="Maximum waiting time"
            value={`${maxWait}m`}
            icon={Timer}
            hint="Longest current wait"
          />
          <StatCard label="Completed visits" value={completed} icon={CheckCircle2} tone="routine" />
          <StatCard
            label="Emergency alerts"
            value={openAlerts}
            icon={AlertTriangle}
            tone={openAlerts > 0 ? "emergency" : "neutral"}
            hint={`${alerts.length} raised today`}
          />
          <StatCard
            label="Queue throughput"
            value={`${throughputPerHour}/hr`}
            icon={Gauge}
            hint="Average patients processed per hour"
          />
          <StatCard
            label="Patients waiting"
            value={queue.filter((e) => e.status === "WAITING").length}
            hint="Not yet called"
          />
          <StatCard
            label="In progress"
            value={queue.filter((e) => e.status === "IN_PROGRESS").length}
            hint="Currently with a clinician"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <h2 className="text-sm font-semibold">Patients by priority</h2>
            <p className="sr-only">
              {`Patients by priority. ${priorityData
                .map((d) => `${d.name}: ${d.value}`)
                .join(", ")}.`}
            </p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                  >
                    {priorityData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.fill}
                        aria-label={`${entry.name}: ${entry.value} patients`}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 flex justify-center gap-4 text-xs">
              {priorityData.map((p) => (
                <li key={p.name} className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: p.fill }}
                    aria-hidden
                  />
                  {p.name} · <span className="font-semibold tabular-nums">{p.value}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold">Patients by department</h2>
            <div
              className="mt-4 h-64"
              role="img"
              aria-label={`Bar chart of patients by department. ${departmentData
                .map((d) => `${d.name}: ${d.patients}`)
                .join(", ")}.`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip contentStyle={TOOLTIP} />
                  <Bar dataKey="patients" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <h2 className="text-sm font-semibold">Queue throughput by hour</h2>
          <p className="text-xs text-muted-foreground">Arrivals against completed consultations.</p>
          <div
            className="mt-4 h-72"
            role="img"
            aria-label={`Line chart of arrivals versus completed consultations by hour. ${throughputData
              .map((d) => `${d.hour}: ${d.arrived} arrived, ${d.completed} completed`)
              .join("; ")}.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={TOOLTIP} />
                <Line
                  type="monotone"
                  dataKey="arrived"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap justify-center gap-4 text-xs">
            <li className="flex items-center gap-1.5">
              <svg width="22" height="8" aria-hidden className="shrink-0">
                <line x1="0" y1="4" x2="22" y2="4" stroke="var(--chart-2)" strokeWidth="2" />
              </svg>
              Arrived (solid line)
            </li>
            <li className="flex items-center gap-1.5">
              <svg width="22" height="8" aria-hidden className="shrink-0">
                <line
                  x1="0"
                  y1="4"
                  x2="22"
                  y2="4"
                  stroke="var(--chart-1)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
              Completed (dashed line)
            </li>
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold">Average wait by department</h2>
          <div
            className="mt-4 h-64"
            role="img"
            aria-label={`Bar chart of average wait in minutes by department. ${departmentData
              .map((d) => `${d.name}: ${d.averageWaitMinutes} minutes`)
              .join(", ")}.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} interval={0} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={TOOLTIP} />
                <Bar dataKey="averageWaitMinutes" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </AsyncSection>
    </div>
  );
}
