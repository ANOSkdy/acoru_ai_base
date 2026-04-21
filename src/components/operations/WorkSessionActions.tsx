"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/Button";

type WorkSessionActionsProps = {
  workSessionId: string;
  isApproved: boolean;
};

export function WorkSessionActions({
  workSessionId,
  isApproved,
}: WorkSessionActionsProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    if (isApproved || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/work-sessions/${workSessionId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const json = await response.json() as { error?: string };

      if (!response.ok) {
        setError(json.error ?? "承認に失敗しました");
        return;
      }

      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={handleApprove}
        disabled={isApproved || submitting}
      >
        {isApproved ? "承認済み" : submitting ? "承認中..." : "承認"}
      </Button>
      {error && <span style={{ color: "var(--danger)", fontSize: "0.8125rem" }}>{error}</span>}
    </>
  );
}
