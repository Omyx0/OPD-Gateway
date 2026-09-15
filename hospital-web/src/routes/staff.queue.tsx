import { createFileRoute } from "@tanstack/react-router";
import { PhoneCall, Sparkles, RefreshCw, Eye, EyeOff } from "lucide-react";
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
import { useStaffStore } from "@/state/staff-store";
import { useStaffAuth } from "@/state/staff-auth";
import { useState } from "react";
import { API_URL } from "@/lib/api";

const DEPARTMENTS = queueService.listDepartmentNames();

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
  const {
    queue,
    departmentFilter,
    setDepartmentFilter,
    hideSeed,
    setHideSeed,
    seedRealtime,
    refreshQueue,
    isLoading,
  } = useStaffStore();
  const [seeding, setSeeding] = useState(false);

  // Filter by department and seed toggle
  const filteredEntries = queue.filter((e) => {
    const matchesDept = departmentFilter === "all" || e.department === departmentFilter;
    const matchesSeed = hideSeed ? !e.isSeed : true;
    return matchesDept && matchesSeed;
  });

  const waiting = filteredEntries.filter((e) => e.status === "WAITING").length;
  const seedCount = queue.filter((e) => e.isSeed).length;

  const handleCallNext = async () => {
    const nextWaiting = filteredEntries.find((e) => e.status === "WAITING");
    if (!nextWaiting) {
      toast("No one is waiting", { description: "The selected queue has no waiting patients." });
      return;
    }

    try {
      await fetch(`${API_URL}/queue/${nextWaiting.id}/call`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      toast.success(`Called ${nextWaiting.token}`, {
        description: `${nextWaiting.patient.name} · ${nextWaiting.department}`,
      });
      await refreshQueue();
    } catch {
      toast.error("Failed to call next patient");
    }
  };

  const handleSeedQueue = async () => {
    try {
      setSeeding(true);
      await seedRealtime();
      toast.success("Real-time queue seeded!", {
        description: "10 realistic multi-priority patient tickets and pending staff accounts generated.",
      });
    } catch {
      toast.error("Failed to seed queue");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Live Real-time Queue</h1>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" /> Live Sync
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {waiting} waiting · {filteredEntries.length} in view
            {seedCount > 0 ? (
              <span className="ml-2 font-mono text-xs text-amber-600 dark:text-amber-400">
                ({seedCount} seeded [S] active)
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seed Toggle Button */}
          {seedCount > 0 && (
            <Button
              variant={hideSeed ? "outline" : "secondary"}
              size="sm"
              onClick={() => setHideSeed(!hideSeed)}
              className="text-xs h-9"
              title={hideSeed ? "Show seeded test users" : "Hide seeded test users"}
            >
              {hideSeed ? (
                <>
                  <Eye className="mr-1.5 size-3.5" /> Show Seeded ({seedCount})
                </>
              ) : (
                <>
                  <EyeOff className="mr-1.5 size-3.5" /> Hide Seeded
                </>
              )}
            </Button>
          )}

          {/* Quick Seed Button for demonstration */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedQueue}
            disabled={seeding}
            className="text-xs h-9 border-dashed"
          >
            <Sparkles className={`mr-1.5 size-3.5 text-amber-500 ${seeding ? "animate-spin" : ""}`} />
            {seeding ? "Seeding..." : "Seed Realtime Queue"}
          </Button>

          {/* Department Filter */}
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48 text-xs h-9" aria-label="Filter by department">
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

          {/* Call Next Button */}
          <Button onClick={handleCallNext} size="sm" className="h-9">
            <PhoneCall className="mr-1.5 size-3.5" aria-hidden />
            Call Next
          </Button>
        </div>
      </div>

      {/* Queue Table */}
      {filteredEntries.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center bg-surface/40">
          <p className="text-base font-medium text-foreground">No patients in this queue view</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {hideSeed
              ? "All active patients in this view are seeded and currently hidden. Click 'Show Seeded' above to view them."
              : "Nobody is waiting in the selected department right now. You can click 'Seed Realtime Queue' to generate multi-priority patient tickets."}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {hideSeed && (
              <Button size="sm" variant="outline" onClick={() => setHideSeed(false)}>
                Show Seeded Patients
              </Button>
            )}
            <Button size="sm" onClick={handleSeedQueue} disabled={seeding}>
              <Sparkles className="mr-1.5 size-3.5" /> Seed Realtime Queue
            </Button>
          </div>
        </div>
      ) : (
        <QueueTable entries={filteredEntries} />
      )}
    </div>
  );
}
