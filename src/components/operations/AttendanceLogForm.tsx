"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/Button";
import {
  formatDateTime,
  toDateTimeLocalValue,
} from "@/src/components/operations/presentation";
import styles from "./OperationForm.module.css";

type SiteOption = {
  id: string;
  code: string;
  name: string;
};

type WorkSessionOption = {
  id: string;
  session_date: string;
  started_at: string;
  user_display_name: string;
};

type AttendanceLogFormProps = {
  cancelHref: string;
  sites: SiteOption[];
  workSessions: WorkSessionOption[];
};

type AttendanceLogFormValues = {
  siteId: string;
  logType: "clock_in" | "clock_out" | "break_start" | "break_end";
  occurredAt: string;
  source: "manual" | "mobile" | "web" | "system";
  workSessionId: string;
  note: string;
};

const DEFAULT_VALUES: AttendanceLogFormValues = {
  siteId: "",
  logType: "clock_in",
  occurredAt: "",
  source: "manual",
  workSessionId: "",
  note: "",
};

export function AttendanceLogForm({
  cancelHref,
  sites,
  workSessions,
}: AttendanceLogFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AttendanceLogFormValues>({
    ...DEFAULT_VALUES,
    occurredAt: toDateTimeLocalValue(new Date().toISOString()),
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sessionHint = useMemo(
    () => workSessions.find((item) => item.id === values.workSessionId) ?? null,
    [values.workSessionId, workSessions],
  );

  function setField<K extends keyof AttendanceLogFormValues>(
    key: K,
    value: AttendanceLogFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: [] }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/v1/attendance/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId: values.siteId || null,
          logType: values.logType,
          occurredAt: new Date(values.occurredAt).toISOString(),
          source: values.source,
          workSessionId: values.workSessionId || null,
          metadata: values.note ? { note: values.note } : {},
        }),
      });

      const json = await response.json() as {
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
      };

      if (response.ok) {
        router.push("/app/operations/attendance-logs");
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

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="occurredAt" className={styles.label}>
            記録日時<span className={styles.required}>*</span>
          </label>
          <input
            id="occurredAt"
            type="datetime-local"
            className={`${styles.input} ${fieldErrors.occurredAt ? styles.fieldError : ""}`}
            value={values.occurredAt}
            onChange={(event) => setField("occurredAt", event.target.value)}
            required
          />
          <p className={styles.helper}>日本時間で入力します。</p>
          {fieldErrors.occurredAt?.[0] && (
            <p className={styles.errorText}>{fieldErrors.occurredAt[0]}</p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="logType" className={styles.label}>
            記録種別<span className={styles.required}>*</span>
          </label>
          <select
            id="logType"
            className={`${styles.select} ${fieldErrors.logType ? styles.fieldError : ""}`}
            value={values.logType}
            onChange={(event) => setField("logType", event.target.value as AttendanceLogFormValues["logType"])}
          >
            <option value="clock_in">出勤</option>
            <option value="clock_out">退勤</option>
            <option value="break_start">休憩開始</option>
            <option value="break_end">休憩終了</option>
          </select>
          {fieldErrors.logType?.[0] && (
            <p className={styles.errorText}>{fieldErrors.logType[0]}</p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="siteId" className={styles.label}>
            現場
          </label>
          <select
            id="siteId"
            className={`${styles.select} ${fieldErrors.siteId ? styles.fieldError : ""}`}
            value={values.siteId}
            onChange={(event) => setField("siteId", event.target.value)}
          >
            <option value="">未設定</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.code})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="source" className={styles.label}>
            登録元<span className={styles.required}>*</span>
          </label>
          <select
            id="source"
            className={`${styles.select} ${fieldErrors.source ? styles.fieldError : ""}`}
            value={values.source}
            onChange={(event) => setField("source", event.target.value as AttendanceLogFormValues["source"])}
          >
            <option value="manual">手動</option>
            <option value="web">Web</option>
            <option value="mobile">モバイル</option>
            <option value="system">システム</option>
          </select>
          {fieldErrors.source?.[0] && (
            <p className={styles.errorText}>{fieldErrors.source[0]}</p>
          )}
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="workSessionId" className={styles.label}>
            紐づける作業セッション
          </label>
          <select
            id="workSessionId"
            className={`${styles.select} ${fieldErrors.workSessionId ? styles.fieldError : ""}`}
            value={values.workSessionId}
            onChange={(event) => setField("workSessionId", event.target.value)}
          >
            <option value="">紐づけなし</option>
            {workSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.session_date} / {session.user_display_name} / {formatDateTime(session.started_at)}
              </option>
            ))}
          </select>
          <p className={styles.helper}>
            直近のセッションから選択できます。未選択でも登録可能です。
          </p>
          {sessionHint && (
            <p className={styles.helper}>
              選択中: {sessionHint.user_display_name} / {sessionHint.session_date} / {formatDateTime(sessionHint.started_at)}
            </p>
          )}
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label htmlFor="note" className={styles.label}>
            補足メモ
          </label>
          <textarea
            id="note"
            className={styles.textarea}
            value={values.note}
            onChange={(event) => setField("note", event.target.value)}
            placeholder="手動補正の理由などを記録できます"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={submitting}>
          {submitting ? "保存中..." : "登録する"}
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
