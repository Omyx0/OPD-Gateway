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
import { useStaffStore } from "@/state/staff-store";

export const Route = createFileRoute("/staff/queue")({
  head: () => ({
    meta: [
      { title: "Live Patient Queue — Smart OPD Staff" },
      {
        name: "description",
        content:
          "Filter, call, reassign and complete patients in the live OPD queue with priority-aware ordering.",
      },
      { property: "og:title", content: "Live Patient Queue — Smart OPD Staff" },
      {
        property: "og:description",
        content: "Call, reassign and complete patients in the live OPD queue.",
      },
    ],
  }),
  component: QueuePage,
});

function QueuePage() {
  const { queue, departmentFilter, setDepartmentFilter, callNext } = useStaffStore();
  const entries = queue.filter(
    (e) => departmentFilter === "all" || e.department === departmentFilter,
  );
  const waiting = entries.filter((e) => e.status === "WAITING").length;
  const { phase, setPhase, reload } = useMockLoad();

  const handleCallNext = () => {
    const next = callNext();
    if (!next) {
      toast("No one is waiting", { description: "The selected queue has no waiting patients." });
      return;
    }
    toast.success(`Called ${next.token}`, {
      description: `${next.patient.name} · ${next.department}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Queue</h1>
          <p className="text-sm text-muted-foreground">
            {waiting} waiting · {entries.length} in view
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
      <StateDemoBar phase={phase} onChange={setPhase} className="w-fit" />
      <AsyncSection
        phase={phase}
        loadingLabel="Updating queue"
        skeleton="table"
        errorTitle="Queue didn't load"
        errorDescription="We couldn't refresh the queue. Patients already called are unaffected — try again."
        onRetry={reload}
        isEmpty={entries.length === 0}
        emptyTitle="No patients in this queue"
        emptyDescription="Nobody is waiting in the selected department right now."
      >
        <QueueTable entries={entries} />
      </AsyncSection>
    </div>
  );
}
