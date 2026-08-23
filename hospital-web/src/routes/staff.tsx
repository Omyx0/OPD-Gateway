import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { StaffShell } from "@/components/staff/StaffShell";
import { useStaffAuth } from "@/state/staff-auth";

export const Route = createFileRoute("/staff")({
  component: StaffLayout,
});

function StaffLayout() {
  const { user } = useStaffAuth();

  // Mock gate only: local state, no auth service.
  if (!user) return <Navigate to="/login" />;

  return (
    <StaffShell>
      <Outlet />
    </StaffShell>
  );
}
