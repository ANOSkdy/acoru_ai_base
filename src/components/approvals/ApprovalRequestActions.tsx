"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/Button";
import styles from "./ApprovalRequestActions.module.css";

type ApprovalRequestActionsProps = {
  approvalId: string;
  disabled: boolean;
};

export function ApprovalRequestActions({
  approvalId,
  disabled,
}: ApprovalRequestActionsProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(action: "approve" | "reject") {
    if (disabled || submitting) {
      return;
    }

    setSubmitting(action);
    setError(null);

    try {
      const response = await fetch(`/api/v1/approvals/${approvalId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: comment.trim() ? comment.trim() : null,
        }),
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(json.error ?? "承認処理に失敗しました。");
        return;
      }

      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className={styles.panel}>
      <p className={styles.description}>
        必要に応じて判断理由を残してから、承認または却下を実行します。
      </p>
      <textarea
        className={styles.textarea}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="コメントを入力"
        disabled={disabled || Boolean(submitting)}
      />
      <div className={styles.actions}>
        <Button
          type="button"
          onClick={() => submit("approve")}
          disabled={disabled || Boolean(submitting)}
        >
          {submitting === "approve" ? "承認中..." : "承認"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => submit("reject")}
          disabled={disabled || Boolean(submitting)}
        >
          {submitting === "reject" ? "却下中..." : "却下"}
        </Button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
