import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Acoru Business Platform Baseline",
  description: "Reusable baseline repository for Acoru business-platform systems.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background:
            "linear-gradient(180deg, #f7fafc 0%, #eef4ff 55%, #ffffff 100%)",
          color: "#162032",
        }}
      >
        {children}
      </body>
    </html>
  );
}
