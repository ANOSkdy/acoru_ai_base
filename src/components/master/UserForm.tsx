"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import styles from "./MasterForm.module.css";

type UserFormValues = {
  employeeCode: string;
  displayName: string;
  email: string;
  status: "active" | "inactive";
};

type UserFormProps = {
  initialValues?: Partial<UserFormValues>;
  id?: string;
  cancelHref: string;
};

const DEFAULTS: UserFormValues = {
  employeeCode: "",
  displayName: "",
  email: "",
  status: "active",
};

export function UserForm({ initialValues, id, cancelHref }: UserFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<UserFormValues>({
    ...DEFAULTS,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserFormValues, string[]>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/v1/users/${id}` : "/api/v1/users";

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
        router.push(`/app/master/users/${json.data.id}`);
      } else if (json.issues?.fieldErrors) {
        setFieldErrors(json.issues.fieldErrors as Partial<Record<keyof UserFormValues, string[]>>);
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
            id="employeeCode"
            label="社員コード"
            value={values.employeeCode}
            onChange={(e) => setField("employeeCode", e.target.value)}
            error={fieldErrors.employeeCode?.[0]}
            placeholder="例: EMP-001"
          />
          <Input
            id="displayName"
            label="表示名"
            value={values.displayName}
            onChange={(e) => setField("displayName", e.target.value)}
            error={fieldErrors.displayName?.[0]}
            placeholder="例: 山田 太郎"
            required
          />
        </div>

        <div className={styles.formRow}>
          <Input
            id="email"
            type="email"
            label="メールアドレス"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            error={fieldErrors.email?.[0]}
            placeholder="例: user@example.com"
            required
          />

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
            {fieldErrors.status && <p className={styles.errorText}>{fieldErrors.status[0]}</p>}
          </div>
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
