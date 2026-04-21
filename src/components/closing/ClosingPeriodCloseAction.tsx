"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/Button";
import styles from "./ClosingPeriodCloseAction.module.css";

type ClosingPeriodCloseActionProps = {
  periodId: string;
  disabled: boolean;
};

export function ClosingPeriodCloseAction({
  periodId,
  disabled,
}: ClosingPeriodCloseActionProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClose() {
    if (disabled || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/closing-periods/${periodId}/close`, {
        method: "POST",
      });
      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(json.error ?? "締め処理に失敗しました。");
        return;
      }

      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.panel}>
      <p className={styles.description}>
        締めを実行すると、この期間は基準状態として確定し、以後の確認対象を切り替えやすくします。
      </p>
      <div>
        <Button type="button" onClick={handleClose} disabled={disabled || submitting}>
          {submitting ? "締め処理中..." : "締めを実行"}
        </Button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
