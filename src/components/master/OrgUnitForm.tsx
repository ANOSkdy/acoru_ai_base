"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import styles from "./MasterForm.module.css";

type OrgUnitOption = { id: string; name: string };
type Values = { code: string; name: string; parentOrgUnitId: string };
type Props = { initialValues?: Partial<Values>; id?: string; cancelHref: string; parentOptions: OrgUnitOption[] };
const DEFAULTS: Values = { code: "", name: "", parentOrgUnitId: "" };

export function OrgUnitForm({ initialValues, id, cancelHref, parentOptions }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Values>({ ...DEFAULTS, ...initialValues });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Values, string[]>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});
    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/v1/org-units/${id}` : "/api/v1/org-units";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const json = await res.json() as { data?: { id: string }; error?: string; issues?: { fieldErrors?: Record<string, string[]> } };
      if (res.ok && json.data) router.push(`/app/master/org-units/${json.data.id}`);
      else if (json.issues?.fieldErrors) setFieldErrors(json.issues.fieldErrors as Partial<Record<keyof Values, string[]>>);
      else setServerError(json.error ?? "保存に失敗しました");
    } catch { setServerError("通信エラーが発生しました"); }
    finally { setSubmitting(false); }
  }

  return <form onSubmit={handleSubmit} noValidate>
    {serverError && <div className={styles.serverError} role="alert">{serverError}</div>}
    <div className={styles.formSection}>
      <div className={styles.formRow}>
        <Input id="code" label="コード" value={values.code} onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))} error={fieldErrors.code?.[0]} required />
        <Input id="name" label="組織ユニット名" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} error={fieldErrors.name?.[0]} required />
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="parentOrgUnitId" className={styles.label}>親組織ユニット</label>
        <select id="parentOrgUnitId" className={styles.select} value={values.parentOrgUnitId} onChange={(e) => setValues((v) => ({ ...v, parentOrgUnitId: e.target.value }))}>
          <option value="">なし</option>
          {parentOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
        </select>
      </div>
    </div>
    <div className={styles.actionRow}><Button type="submit" disabled={submitting}>{submitting ? "保存中..." : "保存"}</Button><Button type="button" variant="secondary" onClick={() => router.push(cancelHref)} disabled={submitting}>キャンセル</Button></div>
  </form>;
}
