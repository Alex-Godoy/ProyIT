"use client";

import { enlaceWhatsApp, type BotonWhatsApp } from "@/lib/sitio";

// Abre WhatsApp con el mensaje armado y avisa al portal qué botón se usó (solo
// el botón y la hora, nada de la persona). El aviso no frena la navegación.
export default function EnlaceWhatsApp({
  boton,
  mensaje,
  className,
  onClick,
  children,
}: {
  boton: BotonWhatsApp;
  mensaje: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={enlaceWhatsApp(mensaje)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        navigator.sendBeacon?.("/api/whatsapp-clic", boton);
        onClick?.();
      }}
      className={className}
    >
      {children}
    </a>
  );
}
