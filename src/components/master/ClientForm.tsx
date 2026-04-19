"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import styles from "./MasterForm.module.css";

type ClientFormValues = {
  code: string;
  name: string;
  status: "active" | "inactive";
};

type ClientFormProps = {
  initialValues?: Partial<ClientFormValues>;
  id?: string;
  cancelHref: string;
};

const DEFAULTS: ClientFormValues = {
  code: "",
  name: "",
  status: "active",
};

export function ClientForm({ initialValues, id, cancelHref }: ClientFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ClientFormValues>({
    ...DEFAULTS,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ClientFormValues, string[]>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/v1/clients/${id}` : "/api/v1/clients";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json() as {
        data?: { id: string };
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
      };

      if (res.ok && json.data) {
        router.push(`/app/master/clients/${json.data.id}`);
      } else if (json.issues?.fieldErrors) {
        setFieldErrors(json.issues.fieldErrors as Partial<Record<keyof ClientFormValues, string[]>>);
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
            placeholder="例: CLI-001"
            required
          />
          <Input
            id="name"
            label="取引先名"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            error={fieldErrors.name?.[0]}
            placeholder="例: 株式会社サンプル"
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="status" className={styles.label}>
            ステータス<span className={styles.required}>*</span>
          </label>
          <select
            id="status"
            className={`${styles.select} ${fieldErrors.status ? styles.selectError : ""}`}
            value={values.status}
            onChange={(e) => setField("status", e.target.value as "active" | "inactive")}
          >
            <option value="active">有効</option>
            <option value="inactive">無効</option>
          </select>
          {fieldErrors.status && (
            <p className={styles.errorText}>{fieldErrors.status[0]}</p>
          )}
        </div>
      </div>

      <div className={styles.actionRow}>
        <Button type="submit" variant="primary" disabled={submitting}>
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
