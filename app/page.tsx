export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
      }}
    >
      <section
        style={{
          width: "min(760px, 100%)",
          background: "rgba(255, 255, 255, 0.92)",
          border: "1px solid #d9e4ff",
          borderRadius: 24,
          padding: 32,
          boxShadow: "0 28px 80px rgba(50, 84, 173, 0.12)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 14,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#4d6bb3",
          }}
        >
          Acoru Reusable Baseline
        </p>
        <h1 style={{ margin: "0 0 16px", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          Business-platform starter for Next.js, Vercel, and Neon Postgres
        </h1>
        <p style={{ margin: "0 0 20px", lineHeight: 1.7, fontSize: 17 }}>
          This repository is intended to be cloned as the starting point for
          future Acoru delivery projects. It includes a server-only DB layer,
          plain SQL migrations, thin API route handlers, and operational docs.
        </p>
        <p style={{ margin: 0, lineHeight: 1.7 }}>
          Local quick start: set a database URL in <code>.env.local</code>, run{" "}
          <code>pnpm install</code>, then <code>pnpm db:migrate</code> and{" "}
          <code>pnpm dev</code>.
        </p>
      </section>
    </main>
  );
}
