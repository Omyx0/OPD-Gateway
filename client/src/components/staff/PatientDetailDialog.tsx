import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { QueueEntry } from "@/types/opd";

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function PatientDetailDialog({
  entry,
  onOpenChange,
  onCall,
  onComplete,
}: {
  entry: QueueEntry | null;
  onOpenChange: (open: boolean) => void;
  onCall?: (entry: QueueEntry) => void;
  onComplete?: (entry: QueueEntry) => void;
}) {
  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {entry ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="tabular-nums">{entry.token}</span>
                <PriorityBadge priority={entry.priority} variant="soft" />
                <StatusBadge status={entry.status} />
              </DialogTitle>
              <DialogDescription>
                Demonstration record — mock data only, no medical diagnosis.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Row label="Patient" value={entry.patient.name} />
                <Row
                  label="Age / Gender"
                  value={`${entry.patient.age} yrs · ${entry.patient.gender}`}
                />
                <Row label="Mobile" value={entry.patient.phone} />
                <Row label="Department" value={entry.department} />
                <Row label="Arrival" value={entry.arrivalTime} />
                <Row label="Wait time" value={`${entry.waitMinutes} min`} />
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Reported symptoms
                </p>
                <p className="mt-1 text-sm">{entry.symptomsSummary}</p>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Triage summary
                </p>
                <p className="mt-1 text-sm">{entry.triageSummary}</p>
                {entry.flags?.length ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {entry.flags.map((f) => (
                      <li
                        key={f}
                        className="rounded-full border border-border bg-background px-2 py-0.5 text-xs"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <div className="flex gap-2">
                {onCall ? (
                  <Button variant="secondary" onClick={() => onCall(entry)}>
                    Call patient
                  </Button>
                ) : null}
                {onComplete ? <Button onClick={() => onComplete(entry)}>Complete</Button> : null}
              </div>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
