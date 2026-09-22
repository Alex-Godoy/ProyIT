import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal ProyIT",
  description:
    "Tu espacio con ProyIT: proyectos, soporte, novedades y beneficios en un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
