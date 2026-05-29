import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:       "MedGuard AI",
  description: "HIPAA-aligned, role-based RAG medical assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
