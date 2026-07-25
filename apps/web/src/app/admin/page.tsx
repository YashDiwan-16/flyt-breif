import { AdminAuthGate } from "@/components/admin-auth-gate";
import { DashboardShell } from "@/components/dashboard-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | FlytBDR Copilot",
  description: "Admin sales cockpit for FlytBase inbound BDR analysis.",
};

export default function AdminPage() {
  return (
    <AdminAuthGate>
      <DashboardShell />
    </AdminAuthGate>
  );
}
