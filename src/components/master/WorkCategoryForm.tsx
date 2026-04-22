"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import styles from "./MasterForm.module.css";

type WorkCategoryFormValues = {
  code: string;
  name: string;
  categoryType: string;
  isBillable: boolean;
};

type WorkCategoryFormProps = {
  initialValues?: Partial<WorkCategoryFormValues>;
  id?: string;
  cancelHref: string;
};

const DEFAULTS: WorkCategoryFormValues = {
  code: "",
  name: "",
  categoryType: "standard",
  isBillable: true,
};

export function WorkCategoryForm({ initialValues, id, cancelHref }: WorkCategoryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<WorkCategoryFormValues>({
    ...DEFAULTS,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof WorkCategoryFormValues, string[]>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof WorkCategoryFormValues>(key: K, value: WorkCategoryFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/v1/work-categories/${id}` : "/api/v1/work-categories";

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
        router.push(`/app/master/work-categories/${json.data.id}`);
      } else if (json.issues?.fieldErrors) {
        setFieldErrors(json.issues.fieldErrors as Partial<Record<keyof WorkCategoryFormValues, string[]>>);
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
            placeholder="例: regular"
            required
          />
          <Input
            id="name"
            label="勤務区分名"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            error={fieldErrors.name?.[0]}
            placeholder="例: Regular Work"
            required
          />
        </div>

        <div className={styles.formRow}>
          <Input
            id="categoryType"
            label="区分タイプ"
            value={values.categoryType}
            onChange={(e) => setField("categoryType", e.target.value)}
            error={fieldErrors.categoryType?.[0]}
            placeholder="例: standard"
            required
          />

          <div className={styles.fieldGroup}>
            <label htmlFor="isBillable" className={styles.label}>
              請求対象<span className={styles.required}>*</span>
            </label>
            <select
              id="isBillable"
              className={`${styles.select} ${fieldErrors.isBillable ? styles.selectError : ""}`}
              value={values.isBillable ? "true" : "false"}
              onChange={(e) => setField("isBillable", e.target.value === "true")}
            >
              <option value="true">対象</option>
              <option value="false">対象外</option>
            </select>
            {fieldErrors.isBillable && <p className={styles.errorText}>{fieldErrors.isBillable[0]}</p>}
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
