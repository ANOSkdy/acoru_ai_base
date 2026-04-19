"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import styles from "./MasterForm.module.css";

type SiteFormValues = {
  projectId: string;
  code: string;
  name: string;
  timezone: string;
  address: string;
  status: "active" | "inactive";
};

type ProjectOption = {
  id: string;
  code: string;
  name: string;
};

type SiteFormProps = {
  projects: ProjectOption[];
  initialValues?: Partial<SiteFormValues>;
  id?: string;
  cancelHref: string;
};

const DEFAULTS: SiteFormValues = {
  projectId: "",
  code: "",
  name: "",
  timezone: "Asia/Tokyo",
  address: "",
  status: "active",
};

export function SiteForm({
  projects,
  initialValues,
  id,
  cancelHref,
}: SiteFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<SiteFormValues>({
    ...DEFAULTS,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SiteFormValues, string[]>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof SiteFormValues>(key: K, value: SiteFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/v1/sites/${id}` : "/api/v1/sites";

    const payload = {
      projectId: values.projectId || null,
      code: values.code,
      name: values.name,
      timezone: values.timezone || "Asia/Tokyo",
      address: values.address || null,
      status: values.status,
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
        router.push(`/app/master/sites/${json.data.id}`);
      } else if (json.issues?.fieldErrors) {
        setFieldErrors(json.issues.fieldErrors as Partial<Record<keyof SiteFormValues, string[]>>);
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
          <label htmlFor="projectId" className={styles.label}>
            プロジェクト
          </label>
          <select
            id="projectId"
            className={styles.select}
            value={values.projectId}
            onChange={(e) => setField("projectId", e.target.value)}
          >
            <option value="">（未設定）</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}（{p.code}）
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
            placeholder="例: SITE-001"
            required
          />
          <Input
            id="name"
            label="現場名"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            error={fieldErrors.name?.[0]}
            placeholder="例: 渋谷A棟"
            required
          />
        </div>

        <div className={styles.formRow}>
          <Input
            id="timezone"
            label="タイムゾーン"
            value={values.timezone}
            onChange={(e) => setField("timezone", e.target.value)}
            error={fieldErrors.timezone?.[0]}
            placeholder="Asia/Tokyo"
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
            {fieldErrors.status && (
              <p className={styles.errorText}>{fieldErrors.status[0]}</p>
            )}
          </div>
        </div>

        <Input
          id="address"
          label="住所"
          value={values.address}
          onChange={(e) => setField("address", e.target.value)}
          error={fieldErrors.address?.[0]}
          placeholder="例: 東京都渋谷区道玄坂1-1-1"
        />
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
