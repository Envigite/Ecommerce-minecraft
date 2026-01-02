import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthInitializer from "@/components/auth/AuthInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Fashion't Park",
    default: "Fashion't Park",
  },
  description: "La mejor tienda de cubos y moda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`
          ${inter.className} 
          min-h-dvh 
          bg-slate-50 
          text-slate-900 
          antialiased
        `}
      >
        <AuthInitializer />
        {children}
      </body>
    </html>
  );
}
