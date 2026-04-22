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
  orgUnitId: string;
  roleIds: string[];
};

type Option = { id: string; name: string; code?: string };

type UserFormProps = {
  initialValues?: Partial<UserFormValues>;
  id?: string;
  cancelHref: string;
  roleOptions?: Option[];
  orgUnitOptions?: Option[];
};

const DEFAULTS: UserFormValues = {
  employeeCode: "",
  displayName: "",
  email: "",
  status: "active",
  orgUnitId: "",
  roleIds: [],
};

export function UserForm({ initialValues, id, cancelHref, roleOptions = [], orgUnitOptions = [] }: UserFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<UserFormValues>({ ...DEFAULTS, ...initialValues });
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

      const json = await res.json() as { data?: { id: string }; error?: string; issues?: { fieldErrors?: Record<string, string[]> } };

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
      {serverError && <div className={styles.serverError} role="alert">{serverError}</div>}

      <div className={styles.formSection}>
        <div className={styles.formRow}>
          <Input id="employeeCode" label="社員コード" value={values.employeeCode} onChange={(e) => setField("employeeCode", e.target.value)} error={fieldErrors.employeeCode?.[0]} placeholder="例: EMP-001" />
          <Input id="displayName" label="表示名" value={values.displayName} onChange={(e) => setField("displayName", e.target.value)} error={fieldErrors.displayName?.[0]} required />
        </div>

        <div className={styles.formRow}>
          <Input id="email" type="email" label="メールアドレス" value={values.email} onChange={(e) => setField("email", e.target.value)} error={fieldErrors.email?.[0]} required />
          <div className={styles.fieldGroup}>
            <label htmlFor="status" className={styles.label}>ステータス<span className={styles.required}>*</span></label>
            <select id="status" className={`${styles.select} ${fieldErrors.status ? styles.selectError : ""}`} value={values.status} onChange={(e) => setField("status", e.target.value as "active" | "inactive")}>
              <option value="active">有効</option>
              <option value="inactive">無効</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="orgUnitId" className={styles.label}>組織ユニット</label>
            <select id="orgUnitId" className={styles.select} value={values.orgUnitId} onChange={(e) => setField("orgUnitId", e.target.value)}>
              <option value="">未設定</option>
              {orgUnitOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="roleIds" className={styles.label}>ロール</label>
            <select
              id="roleIds"
              multiple
              className={styles.textarea}
              value={values.roleIds}
              onChange={(e) => {
                const ids = Array.from(e.target.selectedOptions).map((o) => o.value);
                setField("roleIds", ids);
              }}
            >
              {roleOptions.map((option) => <option key={option.id} value={option.id}>{option.name} ({option.code})</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.actionRow}>
        <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "保存中..." : "保存"}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push(cancelHref)} disabled={submitting}>キャンセル</Button>
      </div>
    </form>
  );
}
