"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import styles from "./MasterForm.module.css";

type ProjectFormValues = {
  clientId: string;
  code: string;
  name: string;
  status: "active" | "inactive";
  startsOn: string;
  endsOn: string;
};

type ClientOption = {
  id: string;
  code: string;
  name: string;
};

type ProjectFormProps = {
  clients: ClientOption[];
  initialValues?: Partial<ProjectFormValues>;
  id?: string;
  cancelHref: string;
};

const DEFAULTS: ProjectFormValues = {
  clientId: "",
  code: "",
  name: "",
  status: "active",
  startsOn: "",
  endsOn: "",
};

export function ProjectForm({
  clients,
  initialValues,
  id,
  cancelHref,
}: ProjectFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProjectFormValues>({
    ...DEFAULTS,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProjectFormValues, string[]>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/v1/projects/${id}` : "/api/v1/projects";

    const payload = {
      clientId: values.clientId || null,
      code: values.code,
      name: values.name,
      status: values.status,
      startsOn: values.startsOn || null,
      endsOn: values.endsOn || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json() as {
        data?: { id: string };
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
      };

      if (res.ok && json.data) {
        router.push(`/app/master/projects/${json.data.id}`);
      } else if (json.issues?.fieldErrors) {
        setFieldErrors(json.issues.fieldErrors as Partial<Record<keyof ProjectFormValues, string[]>>);
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
        <div className={styles.fieldGroup}>
          <label htmlFor="clientId" className={styles.label}>
            取引先
          </label>
          <select
            id="clientId"
            className={styles.select}
            value={values.clientId}
            onChange={(e) => setField("clientId", e.target.value)}
          >
            <option value="">（未設定）</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}（{c.code}）
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <Input
            id="code"
            label="コード"
            value={values.code}
            onChange={(e) => setField("code", e.target.value)}
            error={fieldErrors.code?.[0]}
            placeholder="例: PRJ-001"
            required
          />
          <Input
            id="name"
            label="プロジェクト名"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            error={fieldErrors.name?.[0]}
            placeholder="例: 渋谷再開発プロジェクト"
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

        <div className={styles.formRow}>
          <Input
            id="startsOn"
            label="開始日"
            type="date"
            value={values.startsOn}
            onChange={(e) => setField("startsOn", e.target.value)}
            error={fieldErrors.startsOn?.[0]}
          />
          <Input
            id="endsOn"
            label="終了日"
            type="date"
            value={values.endsOn}
            onChange={(e) => setField("endsOn", e.target.value)}
            error={fieldErrors.endsOn?.[0]}
          />
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
