"use client";

// Lleva a la tarjeta de la solución en "Lo que construimos" y la resalta un
// momento para que se note a dónde llegó.
export default function EnlaceSolucion({
  destino,
  children,
  className = "text-sm font-semibold text-navy hover:underline",
}: {
  destino: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={`#${destino}`}
      onClick={() => {
        const tarjeta = document.getElementById(destino);
        if (!tarjeta) return;
        tarjeta.classList.remove("destacado");
        // Fuerza el reinicio de la animación si se hace clic dos veces.
        void tarjeta.offsetWidth;
        tarjeta.classList.add("destacado");
      }}
      className={className}
    >
      {children}
    </a>
  );
}
