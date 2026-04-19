export default function HomePage() {
  return (
    <main
      style={{
        display: "grid",
        placeItems: "start center",
        padding: "56px 24px 72px",
      }}
    >
      <section
        style={{
          width: "min(880px, 100%)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "40px 36px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 13,
            letterSpacing: "0.04em",
            color: "var(--text-muted)",
            fontWeight: 600,
          }}
        >
          ACORU PLATFORM BASELINE
        </p>
        <h1
          style={{
            margin: "0 0 20px",
            fontSize: "clamp(1.75rem, 3vw, 2.4rem)",
            lineHeight: 1.45,
            letterSpacing: "0.01em",
            color: "var(--text-strong)",
          }}
        >
          業務システム向け Next.js / Vercel / Neon の標準ベースライン
        </h1>
        <p style={{ margin: "0 0 16px", fontSize: 16, color: "var(--text-body)" }}>
          本リポジトリは、Acoru が将来の業務プラットフォーム案件へ再利用するための基盤です。UI
          は日本語運用を前提とした読みやすさを優先し、サーバー専用 DB 層・SQL マイグレーション・薄い API
          ルートという構成を維持します。
        </p>
        <p style={{ margin: "0 0 28px", fontSize: 15, color: "var(--text-muted)" }}>
          初期セットアップ: <code>.env.local</code> に DB 接続文字列を設定し、<code>pnpm install</code> →
          <code>pnpm db:migrate</code> → <code>pnpm dev</code> の順で起動してください。
        </p>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {[
            "日本語 UI 設計ルールはルートの DESIGN.md を参照",
            "API は app/api/v1 配下で薄く保つ",
            "業務ロジックは src/server/services へ分離",
          ].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-surface-muted)",
                padding: "12px 14px",
                fontSize: 14,
                color: "var(--text-body)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
