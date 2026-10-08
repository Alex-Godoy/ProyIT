import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// Títulos del home público.
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal ProyIT",
  description:
    "Tu espacio con ProyIT: proyectos, soporte, novedades y beneficios en un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
