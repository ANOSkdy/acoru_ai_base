"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // 開発用の仮遷移。認証機能は未実装。
    router.push("/app/master/users");
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.platformLabel}>ACORU データ管理システム</p>
          <h1 className={styles.title}>ログイン</h1>
          <p className={styles.subtitle}>
            管理者アカウントでサインインしてください
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="メールアドレス"
            id="email"
            type="email"
            autoComplete="email"
            placeholder="example@company.jp"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="パスワード"
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" style={{ width: "100%", marginTop: 8 }}>
            ログイン
          </Button>
        </form>

        <p className={styles.devNote}>
          開発環境 — 認証機能は未実装です
        </p>
      </div>
    </main>
  );
}
