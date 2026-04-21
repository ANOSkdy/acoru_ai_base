"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/Button";
import {
  formatDateTime,
  getWorkSessionStatusLabel,
  toDateTimeLocalValue,
} from "@/src/components/operations/presentation";
import styles from "./OperationForm.module.css";

type WorkSessionEditFormProps = {
  workSession: {
    id: string;
    started_at: string;
    ended_at: string | null;
    notes: string | null;
    status: string;
  };
  cancelHref: string;
};

type FormValues = {
  startedAt: string;
  endedAt: string;
  notes: string;
};

export function WorkSessionEditForm({
  workSession,
  cancelHref,
}: WorkSessionEditFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    startedAt: toDateTimeLocalValue(workSession.started_at),
    endedAt: toDateTimeLocalValue(workSession.ended_at),
    notes: workSession.notes ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: [] }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    try {
      const response = await fetch(`/api/v1/work-sessions/${workSession.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startedAt: new Date(values.startedAt).toISOString(),
          endedAt: values.endedAt ? new Date(values.endedAt).toISOString() : null,
          notes: values.notes.trim() ? values.notes.trim() : null,
        }),
      });

      const json = await response.json() as {
        data?: { id: string };
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
      };

      if (response.ok && json.data) {
        router.push(`/app/operations/work-sessions/${json.data.id}`);
        router.refresh();
        return;
      }

      if (json.issues?.fieldErrors) {
        setFieldErrors(json.issues.fieldErrors);
      } else {
        setServerError(json.error ?? "保存に失敗しました");
      }
    } catch {
      setServerError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className={styles.serverError} role="alert">
          {serverError}
        </div>
      )}

      <div className={styles.currentValues}>
        <div>
          <span className={styles.currentLabel}>現在の開始日時</span>
          <span className={styles.currentValue}>{formatDateTime(workSession.started_at)}</span>
        </div>
        <div>
          <span className={styles.currentLabel}>現在の終了日時</span>
          <span className={styles.currentValue}>{formatDateTime(workSession.ended_at)}</span>
        </div>
        <div>
          <span className={styles.currentLabel}>ステータス</span>
          <span className={styles.currentValue}>{getWorkSessionStatusLabel(workSession.status)}</span>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="startedAt" className={styles.label}>
            開始日時<span className={styles.required}>*</span>
          </label>
          <input
            id="startedAt"
            type="datetime-local"
            className={`${styles.input} ${fieldErrors.startedAt ? styles.fieldError : ""}`}
            value={values.startedAt}
            onChange={(event) => setField("startedAt", event.target.value)}
            required
          />
          {fieldErrors.startedAt?.[0] && (
            <p className={styles.errorText}>{fieldErrors.startedAt[0]}</p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="endedAt" className={styles.label}>
            終了日時
          </label>
          <input
            id="endedAt"
            type="datetime-local"
            className={`${styles.input} ${fieldErrors.endedAt ? styles.fieldError : ""}`}
            value={values.endedAt}
            onChange={(event) => setField("endedAt", event.target.value)}
          />
          <p className={styles.helper}>未入力の場合は進行中として扱います。</p>
          {fieldErrors.endedAt?.[0] && (
            <p className={styles.errorText}>{fieldErrors.endedAt[0]}</p>
          )}
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="notes" className={styles.label}>
            備考
          </label>
          <textarea
            id="notes"
            className={`${styles.textarea} ${fieldErrors.notes ? styles.fieldError : ""}`}
            value={values.notes}
            onChange={(event) => setField("notes", event.target.value)}
            placeholder="補正理由や申し送りを記録します"
          />
          {fieldErrors.notes?.[0] && (
            <p className={styles.errorText}>{fieldErrors.notes[0]}</p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={submitting}>
          {submitting ? "保存中..." : "保存"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(cancelHref)}
          disabled={submitting}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
