import { createFileRoute } from "@tanstack/react-router";
import { PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { QueueTable } from "@/components/staff/QueueTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queueService } from "@/services";

const DEPARTMENTS = queueService.listDepartmentNames();
import { AsyncSection, StateDemoBar, useMockLoad } from "@/components/common/AsyncSection";
import { useStaffAuth } from "@/state/staff-auth";
import { useEffect, useState } from "react";
import type { QueueEntry } from "@/services/types";
import { API_URL } from "@/lib/api";

export const Route = createFileRoute("/staff/queue")({
  head: () => ({
    meta: [
      { title: "Live Patient Queue — Smart OPD Staff" },
      { name: "description", content: "Filter, call, reassign and complete patients in the live OPD queue." },
    ],
  }),
  component: QueuePage,
});

function QueuePage() {
  const { user } = useStaffAuth();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const { phase, setPhase, reload } = useMockLoad();

  const fetchQueue = async () => {
    try {
      if (!user?.token) return;
      const res = await fetch(`${API_URL}/queue`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const json = await res.json();
      
      const mapped: QueueEntry[] = json.data.map((q: any) => ({
        id: q.id,
        token: q.token,
        patient: { name: q.visits?.patients?.full_name || 'Unknown Patient' },
        department: q.departments?.name || 'Unknown',
        priority: q.priority,
        status: q.status,
        arrivalTime: new Date(q.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        waitMinutes: Math.floor((Date.now() - new Date(q.arrival_time).getTime()) / 60000),
      }));

      setEntries(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  // Poll every 3 seconds for live updates for the demo
  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const filteredEntries = entries.filter(
    (e) => departmentFilter === "all" || e.department === departmentFilter,
  );
  const waiting = filteredEntries.filter((e) => e.status === "WAITING").length;

  const handleCallNext = async () => {
    const nextWaiting = filteredEntries.find(e => e.status === "WAITING");
    if (!nextWaiting) {
      toast("No one is waiting", { description: "The selected queue has no waiting patients." });
      return;
    }
    
    // API call to update status to CALLED
    try {
      await fetch(`${API_URL}/queue/${nextWaiting.id}/call`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      toast.success(`Called ${nextWaiting.token}`, {
        description: `${nextWaiting.patient.name} · ${nextWaiting.department}`,
      });
      fetchQueue();
    } catch (err) {
      toast.error("Failed to call next patient");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Live Real-time Queue</h1>
          <p className="text-sm text-muted-foreground">
            {waiting} waiting · {filteredEntries.length} in view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-56" aria-label="Filter by department">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCallNext}>
            <PhoneCall aria-hidden />
            Call next
          </Button>
        </div>
      </div>
      
      <AsyncSection
        phase={phase}
        loadingLabel="Loading live queue"
        skeleton="table"
        errorTitle="Queue didn't load"
        errorDescription="Failed to connect to backend."
        onRetry={reload}
        isEmpty={filteredEntries.length === 0}
        emptyTitle="No patients in this queue"
        emptyDescription="Nobody is waiting in the selected department right now."
      >
        <QueueTable entries={filteredEntries} />
      </AsyncSection>
    </div>
  );
}
