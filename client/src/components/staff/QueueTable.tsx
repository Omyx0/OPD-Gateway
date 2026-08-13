import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  MoreHorizontal,
  PhoneCall,
  Play,
  RotateCcw,
  Shuffle,
  SkipForward,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { QueueStageIndicator } from "@/components/staff/QueueStageIndicator";
import { EmptyState } from "@/components/common/EmptyState";
import { PatientDetailDialog } from "@/components/staff/PatientDetailDialog";
import { useStaffStore } from "@/state/staff-store";
import { useNotifications } from "@/state/notifications";
import { queueService } from "@/services";
import type { QueueEntry, QueueStatus } from "@/services";

const DEPARTMENTS = queueService.listDepartmentNames();

type Confirmation = {
  entry: QueueEntry;
  title: string;
  description: string;
  actionLabel: string;
  destructive?: boolean;
  run: () => void;
};

export function QueueTable({
  entries,
  onView,
}: {
  entries: QueueEntry[];
  onView?: (entry: QueueEntry) => void;
}) {
  const { setStatus, reassign, recentlyUpdated } = useStaffStore();
  const { notify } = useNotifications();
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [viewing, setViewing] = useState<QueueEntry | null>(null);

  const handleView = (entry: QueueEntry) => {
    if (onView) onView(entry);
    else setViewing(entry);
  };

  const call = (e: QueueEntry) => {
    setStatus(e.id, "CALLED");
    notify({
      kind: "QUEUE",
      title: `Queue update · ${e.token} called`,
      body: `${e.patient.name} was called to ${e.department}.`,
    });
    toast.success(`Called ${e.token}`, { description: `${e.patient.name} · ${e.department}` });
  };

  const start = (e: QueueEntry) => {
    setStatus(e.id, "IN_PROGRESS");
    notify({
      kind: "STAFF_ACTION",
      title: `${e.token} moved to in progress`,
      body: `${e.patient.name} · ${e.department} consultation started.`,
    });
    toast.success(`${e.token} is now in progress`, { description: e.department });
  };

  const complete = (e: QueueEntry) => {
    setConfirmation({
      entry: e,
      title: `Mark ${e.token} as done?`,
      description: `${e.patient.name} will be removed from the active queue and marked as completed for this visit.`,
      actionLabel: "Mark done",
      run: () => {
        setStatus(e.id, "COMPLETED");
        notify({
          kind: "STAFF_ACTION",
          title: `${e.token} marked done`,
          body: `${e.patient.name} · ${e.department} visit completed.`,
        });
        toast.success(`${e.token} marked done`);
      },
    });
  };

  const skip = (e: QueueEntry) => {
    setConfirmation({
      entry: e,
      title: `Are you sure you want to skip ${e.token}?`,
      description: `${e.patient.name} will be moved out of the active queue and must be re-called manually.`,
      actionLabel: "Skip patient",
      destructive: true,
      run: () => {
        setStatus(e.id, "SKIPPED");
        notify({
          kind: "STAFF_ACTION",
          title: `${e.token} skipped`,
          body: `${e.patient.name} was skipped in ${e.department}.`,
        });
        toast(`${e.token} skipped`, { description: "Re-call the patient when they return." });
      },
    });
  };

  const moveTo = (e: QueueEntry, department: string) => {
    setConfirmation({
      entry: e,
      title: `Reassign ${e.token} to ${department}?`,
      description: `${e.patient.name} will leave the ${e.department} queue and re-enter at ${department}. Their reported wait time is carried over.`,
      actionLabel: "Reassign",
      run: () => {
        reassign(e.id, department);
        notify({
          kind: "QUEUE",
          title: `${e.token} reassigned`,
          body: `${e.patient.name} moved from ${e.department} to ${department}.`,
        });
        toast.success(`${e.token} reassigned`, { description: department });
      },
    });
  };

  const restore = (e: QueueEntry) => {
    setStatus(e.id, "WAITING");
    toast(`${e.token} returned to waiting`);
  };

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No patients in this view"
        description="Nobody is currently waiting with the selected filters."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableCaption className="sr-only">
            Live patient queue with token, priority, status and available actions.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="whitespace-nowrap">
                Token
              </TableHead>
              <TableHead scope="col">Patient</TableHead>
              <TableHead scope="col">Priority</TableHead>
              <TableHead scope="col">Department</TableHead>
              <TableHead scope="col">Arrival</TableHead>
              <TableHead scope="col" className="whitespace-nowrap text-right">
                Wait
              </TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col" className="text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {entries.map((e) => (
                <QueueRow
                  key={e.id}
                  entry={e}
                  updated={Boolean(recentlyUpdated[e.id])}
                  onCall={() => call(e)}
                  onStart={() => start(e)}
                  onComplete={() => complete(e)}
                  onSkip={() => skip(e)}
                  onRestore={() => restore(e)}
                  onView={() => handleView(e)}
                  onMoveTo={(d) => moveTo(e, d)}
                />
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <PatientDetailDialog
        entry={viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        onCall={(e) => {
          call(e);
          setViewing(null);
        }}
        onComplete={(e) => {
          setViewing(null);
          complete(e);
        }}
      />

      <AlertDialog open={!!confirmation} onOpenChange={(o) => !o && setConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmation?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmation?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                confirmation?.destructive &&
                  "bg-emergency text-white hover:bg-emergency/90 focus-visible:ring-emergency/40",
              )}
              onClick={() => {
                confirmation?.run();
                setConfirmation(null);
              }}
            >
              {confirmation?.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function QueueRow({
  entry,
  updated,
  onCall,
  onStart,
  onComplete,
  onSkip,
  onRestore,
  onView,
  onMoveTo,
}: {
  entry: QueueEntry;
  updated: boolean;
  onCall: () => void;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onRestore: () => void;
  onView: () => void;
  onMoveTo: (department: string) => void;
}) {
  const e = entry;
  const closed: QueueStatus[] = ["COMPLETED", "SKIPPED"];
  const isClosed = closed.includes(e.status);

  const primary = useMemo(() => {
    if (e.status === "WAITING") return { label: "Call", icon: PhoneCall, run: onCall } as const;
    if (e.status === "CALLED") return { label: "Start", icon: Play, run: onStart } as const;
    if (e.status === "IN_PROGRESS")
      return { label: "Done", icon: CheckCircle2, run: onComplete } as const;
    return { label: "Re-queue", icon: RotateCcw, run: onRestore } as const;
  }, [e.status, onCall, onStart, onComplete, onRestore]);

  const PrimaryIcon = primary.icon;

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      data-state-updated={updated ? "true" : undefined}
      className={cn(
        "border-b border-border transition-colors last:border-0 hover:bg-muted/40",
        updated && "queue-row-flash",
        isClosed && "opacity-70",
      )}
    >
      <TableCell className="whitespace-nowrap font-semibold tabular-nums">{e.token}</TableCell>
      <TableCell>
        <span className="block whitespace-nowrap font-medium">{e.patient.name}</span>
        <span className="block text-xs text-muted-foreground">
          {e.patient.age} yrs · {e.patient.gender}
        </span>
      </TableCell>
      <TableCell>
        <PriorityBadge priority={e.priority} variant="soft" />
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm">{e.department}</TableCell>
      <TableCell className="text-sm tabular-nums">{e.arrivalTime}</TableCell>
      <TableCell className="text-right text-sm tabular-nums">{e.waitMinutes}m</TableCell>
      <TableCell>
        <div className="space-y-1.5">
          <StatusBadge status={e.status} />
          <QueueStageIndicator status={e.status} />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button
            variant={e.status === "IN_PROGRESS" ? "default" : "secondary"}
            size="sm"
            onClick={primary.run}
            aria-label={`${primary.label} ${e.token}`}
          >
            <PrimaryIcon aria-hidden />
            {primary.label}
          </Button>
          <Button variant="ghost" size="sm" onClick={onView} aria-label={`View ${e.token}`}>
            <Eye aria-hidden />
            View
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label={`Reassign ${e.token}`}>
                <Shuffle aria-hidden />
                Reassign
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Move to department</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {DEPARTMENTS.filter((d) => d !== e.department).map((d) => (
                <DropdownMenuItem key={d} onSelect={() => onMoveTo(d)}>
                  {d}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label={`More actions for ${e.token}`}>
                <MoreHorizontal aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Change stage</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={e.status === "CALLED"} onSelect={onCall}>
                <PhoneCall aria-hidden />
                Call patient
              </DropdownMenuItem>
              <DropdownMenuItem disabled={e.status === "IN_PROGRESS"} onSelect={onStart}>
                <Play aria-hidden />
                Mark in progress
              </DropdownMenuItem>
              <DropdownMenuItem disabled={e.status === "COMPLETED"} onSelect={onComplete}>
                <CheckCircle2 aria-hidden />
                Mark done
              </DropdownMenuItem>
              <DropdownMenuItem disabled={e.status === "WAITING"} onSelect={onRestore}>
                <RotateCcw aria-hidden />
                Return to waiting
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={e.status === "SKIPPED"} onSelect={onSkip}>
                <SkipForward aria-hidden />
                Skip patient
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </motion.tr>
  );
}
