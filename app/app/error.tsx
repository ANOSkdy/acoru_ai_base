"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { DatabaseSetupState } from "@/src/components/ui/DatabaseSetupState";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { classifyDatabaseSetupIssue } from "@/src/lib/database-setup";

type AppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppErrorPage({ error, reset }: AppErrorPageProps) {
  const pathname = usePathname();
  const issue = useMemo(() => classifyDatabaseSetupIssue(error), [error]);

  if (issue) {
    return (
      <DatabaseSetupState issue={issue} pathname={pathname} onRetry={reset} />
    );
  }

  return (
    <main style={{ width: "min(880px, 100%)", margin: "0 auto", padding: "40px 24px 56px" }}>
      <Card>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: "var(--text-muted)",
            textTransform: "uppercase",
          }}
        >
          Local verification
        </p>
        <h1 style={{ margin: 0, fontSize: "1.4rem", lineHeight: 1.45 }}>
          This page could not be rendered.
        </h1>
        <p style={{ margin: "12px 0 0", color: "var(--text-body)", lineHeight: 1.7 }}>
          An unexpected error interrupted rendering. If this is a DB bootstrap
          problem, check /api/v1/health/db and the local setup docs before digging
          deeper into the page itself.
        </p>
        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-surface-muted)",
            border: "1px solid var(--border-soft)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: "0.82rem",
            color: "var(--text-body)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {error.message || "Unknown render error"}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <Button type="button" onClick={reset}>
            Retry
          </Button>
        </div>
      </Card>
    </main>
  );
}
