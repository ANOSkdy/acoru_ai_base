"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import styles from "./MasterForm.module.css";

type OrganizationFormValues = { code: string; name: string; status: "active" | "inactive" };
type Props = { initialValues?: Partial<OrganizationFormValues>; id?: string; cancelHref: string };
const DEFAULTS: OrganizationFormValues = { code: "", name: "", status: "active" };

export function OrganizationForm({ initialValues, id, cancelHref }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<OrganizationFormValues>({ ...DEFAULTS, ...initialValues });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof OrganizationFormValues, string[]>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});
    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/v1/organizations/${id}` : "/api/v1/organizations";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const json = await res.json() as { data?: { id: string }; error?: string; issues?: { fieldErrors?: Record<string, string[]> } };
      if (res.ok && json.data) router.push(`/app/master/organizations/${json.data.id}`);
      else if (json.issues?.fieldErrors) setFieldErrors(json.issues.fieldErrors as Partial<Record<keyof OrganizationFormValues, string[]>>);
      else setServerError(json.error ?? "保存に失敗しました");
    } catch {
      setServerError("通信エラーが発生しました");
    } finally { setSubmitting(false); }
  }

  return <form onSubmit={handleSubmit} noValidate>
    {serverError && <div className={styles.serverError} role="alert">{serverError}</div>}
    <div className={styles.formSection}>
      <div className={styles.formRow}>
        <Input id="code" label="コード" value={values.code} onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))} error={fieldErrors.code?.[0]} required />
        <Input id="name" label="組織名" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} error={fieldErrors.name?.[0]} required />
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="status" className={styles.label}>ステータス<span className={styles.required}>*</span></label>
        <select id="status" className={styles.select} value={values.status} onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as "active"|"inactive" }))}>
          <option value="active">有効</option>
          <option value="inactive">無効</option>
        </select>
      </div>
    </div>
    <div className={styles.actionRow}><Button type="submit" disabled={submitting}>{submitting ? "保存中..." : "保存"}</Button><Button type="button" variant="secondary" onClick={() => router.push(cancelHref)} disabled={submitting}>キャンセル</Button></div>
  </form>;
}
