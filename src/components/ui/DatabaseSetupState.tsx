import Link from "next/link";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import type { DatabaseSetupIssue } from "@/src/lib/database-setup";
import styles from "./DatabaseSetupState.module.css";

type DatabaseSetupStateProps = {
  issue: DatabaseSetupIssue;
  pathname?: string;
  onRetry?: () => void;
};

export function DatabaseSetupState({
  issue,
  pathname,
  onRetry,
}: DatabaseSetupStateProps) {
  return (
    <div className={styles.page}>
      <Card>
        <p className={styles.eyebrow}>Local setup guidance</p>
        <h1 className={styles.title}>{issue.title}</h1>
        <p className={styles.summary}>{issue.summary}</p>

        <p className={styles.stepsTitle}>Next steps</p>
        <ol className={styles.steps}>
          {issue.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <div className={styles.detail}>
          <span className={styles.detailLabel}>Detected error</span>
          <pre className={styles.detailCode}>{issue.detail}</pre>
        </div>

        {pathname && (
          <p className={styles.meta}>Page: {pathname}</p>
        )}

        <p className={styles.meta}>
          Tables such as clients, projects, and sites are created by the baseline
          SQL migrations under src/server/db/migrations.
        </p>

        <div className={styles.actions}>
          {onRetry ? (
            <Button type="button" variant="primary" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
          <Link href="/app/dashboard" className={styles.link}>
            Back to dashboard
          </Link>
          <Link href="/api/v1/health/db" className={styles.link}>
            Open DB health check
          </Link>
        </div>
      </Card>
    </div>
  );
}
