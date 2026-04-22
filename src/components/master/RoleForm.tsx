"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import styles from "./MasterForm.module.css";

type RoleFormValues = { code: string; name: string; description: string };

type RoleFormProps = { initialValues?: Partial<RoleFormValues>; id?: string; cancelHref: string };

const DEFAULTS: RoleFormValues = { code: "", name: "", description: "" };

export function RoleForm({ initialValues, id, cancelHref }: RoleFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<RoleFormValues>({ ...DEFAULTS, ...initialValues });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RoleFormValues, string[]>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});
    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/v1/roles/${id}` : "/api/v1/roles";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const json = await res.json() as { data?: { id: string }; error?: string; issues?: { fieldErrors?: Record<string, string[]> } };
      if (res.ok && json.data) router.push(`/app/master/roles/${json.data.id}`);
      else if (json.issues?.fieldErrors) setFieldErrors(json.issues.fieldErrors as Partial<Record<keyof RoleFormValues, string[]>>);
      else setServerError(json.error ?? "保存に失敗しました");
    } catch {
      setServerError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div className={styles.serverError} role="alert">{serverError}</div>}
      <div className={styles.formSection}>
        <div className={styles.formRow}>
          <Input id="code" label="コード" value={values.code} onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))} error={fieldErrors.code?.[0]} required />
          <Input id="name" label="ロール名" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} error={fieldErrors.name?.[0]} required />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="description" className={styles.label}>説明</label>
          <textarea id="description" className={styles.textarea} value={values.description} onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} />
          {fieldErrors.description && <p className={styles.errorText}>{fieldErrors.description[0]}</p>}
        </div>
      </div>
      <div className={styles.actionRow}>
        <Button type="submit" disabled={submitting}>{submitting ? "保存中..." : "保存"}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push(cancelHref)} disabled={submitting}>キャンセル</Button>
      </div>
    </form>
  );
}
