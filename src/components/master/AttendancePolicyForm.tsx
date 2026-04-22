"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import styles from "./MasterForm.module.css";

type AttendancePolicyFormValues = {
  code: string;
  name: string;
  rulesText: string;
};

type AttendancePolicyFormProps = {
  initialValues?: Partial<AttendancePolicyFormValues>;
  id?: string;
  cancelHref: string;
};

const DEFAULTS: AttendancePolicyFormValues = {
  code: "",
  name: "",
  rulesText: "{}",
};

function parseRules(rulesText: string) {
  try {
    const parsed = JSON.parse(rulesText) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { error: "ルールはJSONオブジェクトで入力してください" };
    }
    return { data: parsed as Record<string, unknown> };
  } catch {
    return { error: "ルールは有効なJSONで入力してください" };
  }
}

export function AttendancePolicyForm({ initialValues, id, cancelHref }: AttendancePolicyFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AttendancePolicyFormValues>({
    ...DEFAULTS,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof AttendancePolicyFormValues, string[]>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof AttendancePolicyFormValues>(
    key: K,
    value: AttendancePolicyFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    const parsedRules = parseRules(values.rulesText);
    if (!parsedRules.data) {
      setFieldErrors({ rulesText: [parsedRules.error ?? "入力内容を確認してください"] });
      setSubmitting(false);
      return;
    }

    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/v1/attendance-policies/${id}` : "/api/v1/attendance-policies";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: values.code,
          name: values.name,
          rules: parsedRules.data,
        }),
      });

      const json = (await res.json()) as {
        data?: { id: string };
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
      };

      if (res.ok && json.data) {
        router.push(`/app/master/attendance-policies/${json.data.id}`);
      } else if (json.issues?.fieldErrors) {
        const nextErrors: Partial<Record<keyof AttendancePolicyFormValues, string[]>> = {
          code: json.issues.fieldErrors.code,
          name: json.issues.fieldErrors.name,
          rulesText: json.issues.fieldErrors.rules,
        };
        setFieldErrors(nextErrors);
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
    <form onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className={styles.serverError} role="alert">
          {serverError}
        </div>
      )}

      <div className={styles.formSection}>
        <div className={styles.formRow}>
          <Input
            id="code"
            label="コード"
            value={values.code}
            onChange={(e) => setField("code", e.target.value)}
            error={fieldErrors.code?.[0]}
            placeholder="例: default"
            required
          />
          <Input
            id="name"
            label="勤怠ポリシー名"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            error={fieldErrors.name?.[0]}
            placeholder="例: 標準ポリシー"
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="rulesText" className={styles.label}>
            ルール(JSON)<span className={styles.required}>*</span>
          </label>
          <textarea
            id="rulesText"
            className={`${styles.textarea} ${fieldErrors.rulesText ? styles.textareaError : ""}`}
            value={values.rulesText}
            onChange={(e) => setField("rulesText", e.target.value)}
            rows={12}
            placeholder='例: {"rounding": {"unit": 15}}'
            required
          />
          <p className={styles.helperText}>JSONオブジェクト形式で入力してください</p>
          {fieldErrors.rulesText && <p className={styles.errorText}>{fieldErrors.rulesText[0]}</p>}
        </div>
      </div>

      <div className={styles.actionRow}>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "保存中..." : "保存"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push(cancelHref)} disabled={submitting}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
