import { AppShell } from "@/components/layout/app-shell";

/** Shared shell (header + bottom navigation) for all authenticated pages. */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
