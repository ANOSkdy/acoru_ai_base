import type { ReactNode } from "react";
import { AppShell } from "@/src/components/layout/AppShell";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
