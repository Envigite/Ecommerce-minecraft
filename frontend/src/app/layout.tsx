import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fashion't Park",
  description: "E-commerce con Next.js + TypeScript",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-linear-to-r from-neutral-300 to-stone-400 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
