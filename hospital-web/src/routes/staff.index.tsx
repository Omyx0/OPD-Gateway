import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CircleAlert, CircleCheck, Clock, Hourglass, Users } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { EmergencyAlertPanel } from "@/components/staff/EmergencyAlertPanel";
import { QueueTable } from "@/components/staff/QueueTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AsyncSection, StateDemoBar, useMockLoad } from "@/components/common/AsyncSection";
import { useStaffStore } from "@/state/staff-store";

export const Route = createFileRoute("/staff/")({
  head: () => ({
    meta: [
      { title: "OPD Operations Dashboard — Smart OPD Staff" },
      {
        name: "description",
        content:
          "Live OPD operations overview: emergency, priority and routine counts, waiting times and the active patient queue.",
      },
      { property: "og:title", content: "OPD Operations Dashboard — Smart OPD Staff" },
      {
        property: "og:description",
        content: "Live triage counts, waiting times and the active OPD patient queue.",
      },
    ],
  }),
  component: StaffDashboard,
});

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStaffAuth } from "@/state/staff-auth";

function StaffDashboard() {
  const { user } = useStaffAuth();
  const queryClient = useQueryClient();

  const { data: queueData = [], isLoading } = useQuery({
    queryKey: ["queue"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/queue`, {
        headers: { Authorization: `Bearer ${user?.token}` }
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
          arrivalTime: new Date(d.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          department: d.departments?.name ?? 'General',
          patient: {
            name: d.visits?.patients?.full_name ?? 'Unknown',
            age: age ?? '-',
            gender: d.visits?.patients?.gender ?? '-',
          }
        };
      });
    },
    refetchInterval: 5000
  });

  const callMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/queue/${id}/call`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error("Failed to call");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["queue"] })
  });

  const active = queueData.filter((e: any) => e.status !== "COMPLETED" && e.status !== "SKIPPED");
  const count = (p: string) => active.filter((e: any) => e.priority === p).length;
  const waits = active.map((e: any) => e.waitMinutes);
  const avg = waits.length ? Math.round(waits.reduce((a: any, b: any) => a + b, 0) / waits.length) : 0;
  const longest = waits.length ? Math.max(...waits) : 0;
  const { phase, setPhase, reload } = useMockLoad();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations dashboard</h1>
          <p className="text-sm text-muted-foreground">Live OPD queue overview (Real Backend)</p>
        </div>
        <Button
          onClick={() => {
            const next = active.find((e: any) => e.status === "WAITING");
            if (!next) {
              toast("No one is waiting", { description: "The queue has no waiting patients." });
              return;
            }
            callMutation.mutate(next.id, {
              onSuccess: () => toast.success(`Called ${next.token}`)
            });
          }}
          disabled={callMutation.isPending}
        >
          {callMutation.isPending ? "Calling..." : "Call next patient"}
        </Button>
      </div>

      <EmergencyAlertPanel />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <StatCard
          label="Emergency"
          value={count("RED")}
          tone="emergency"
          icon={AlertTriangle}
          hint="Immediate attention"
        />
        <StatCard
          label="Priority"
          value={count("YELLOW")}
          tone="priority"
          icon={CircleAlert}
          hint="Review sooner"
        />
        <StatCard
          label="Routine"
          value={count("GREEN")}
          tone="routine"
          icon={CircleCheck}
          hint="Normal order"
        />
        <StatCard label="Average wait" value={`${avg}m`} icon={Clock} />
        <StatCard label="Longest wait" value={`${longest}m`} icon={Hourglass} />
        <StatCard label="Total waiting" value={active.length} icon={Users} />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Live queue</h2>
          <StateDemoBar phase={phase} onChange={setPhase} />
        </div>
        <AsyncSection
          phase={phase}
          loadingLabel="Updating queue"
          skeleton="table"
          errorTitle="Live queue didn't load"
          errorDescription="We couldn't refresh the live queue. Try again — no patient records were changed."
          onRetry={reload}
          isEmpty={active.length === 0}
          emptyTitle="No patients waiting"
          emptyDescription="Every patient has been seen. New arrivals will appear here."
        >
          <QueueTable entries={active} />
        </AsyncSection>
      </section>
    </div>
  );
}
