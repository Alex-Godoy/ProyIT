import Link from "next/link";
import { Logo } from "@/components/brand";
import { POLITICA_FECHA, POLITICA_VERSION, RESPONSABLE } from "@/lib/empresa";

export const metadata = {
  title: "Política de Privacidad · Portal ProyIT",
  description: "Cómo ProyIT trata tus datos personales en el portal de clientes, conforme a la Ley 21.719.",
};

const SECCIONES = [
  { id: "responsable", titulo: "1. Quién es responsable de tus datos" },
  { id: "datos", titulo: "2. Qué datos tratamos" },
  { id: "finalidades", titulo: "3. Para qué los usamos y con qué base legal" },
  { id: "encargados", titulo: "4. Con quién los compartimos" },
  { id: "transferencias", titulo: "5. Transferencias internacionales" },
  { id: "conservacion", titulo: "6. Cuánto tiempo los guardamos" },
  { id: "seguridad", titulo: "7. Cómo los protegemos" },
  { id: "derechos", titulo: "8. Tus derechos y cómo ejercerlos" },
  { id: "cookies", titulo: "9. Cookies" },
  { id: "cambios", titulo: "10. Cambios a esta política" },
];

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200/70 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <Link href="/login" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark">
            Ingresar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-blue">Portal de clientes</p>
        <h1 className="mt-2 text-3xl font-extrabold text-navy sm:text-4xl">Política de Privacidad</h1>
        <p className="mt-3 text-muted">
          Vigente desde el {POLITICA_FECHA} · Versión {POLITICA_VERSION}. Redactada conforme a la Ley N° 19.628 sobre
          protección de la vida privada, modificada por la Ley N° 21.719.
        </p>

        <nav aria-label="Índice" className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-6">
          <p className="text-sm font-semibold text-ink">Contenido</p>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {SECCIONES.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-brand-blue hover:underline">
                  {s.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="mt-8 space-y-10 rounded-2xl bg-white p-5 leading-relaxed text-ink ring-1 ring-slate-200 sm:p-8 [&_h2]:scroll-mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
          <section>
            <h2 id="responsable">1. Quién es responsable de tus datos</h2>
            <p>
              El responsable del tratamiento es <strong>{RESPONSABLE.razonSocial}</strong> ({RESPONSABLE.nombreComercial}),
              RUT {RESPONSABLE.rut}, con domicilio en {RESPONSABLE.domicilio}.
            </p>
            <p>
              Para cualquier consulta sobre tus datos personales o para ejercer tus derechos, escríbenos a{" "}
              <strong>{RESPONSABLE.emailPrivacidad}</strong> o usa la sección <em>Mis datos</em> del portal.
            </p>
          </section>

          <section>
            <h2 id="datos">2. Qué datos tratamos</h2>
            <ul>
              <li>
                <strong>Datos de tu cuenta:</strong> nombre, correo electrónico, empresa que indicas al registrarte y, si
                ingresas con Google, tu nombre y foto de perfil de esa cuenta.
              </li>
              <li>
                <strong>Datos de clientes:</strong> razón social o nombre, RUT, giro, correo, teléfono y dirección de las
                empresas y personas con las que trabajamos, y los correos de las personas autorizadas a ver sus proyectos.
              </li>
              <li>
                <strong>Datos de los proyectos:</strong> etapas, hitos, novedades y documentos que compartimos contigo.
              </li>
              <li>
                <strong>Datos técnicos:</strong> registros de inicio de sesión y de cambios en el portal, y señales del
                navegador usadas por la verificación anti-bots, necesarios para su seguridad.
              </li>
            </ul>
            <p>
              No solicitamos datos sensibles (salud, origen étnico, opiniones políticas, datos biométricos, entre otros). Te
              pedimos no incluirlos en documentos o mensajes que compartas por el portal.
            </p>
          </section>

          <section>
            <h2 id="finalidades">3. Para qué los usamos y con qué base legal</h2>
            <ul>
              <li>
                <strong>Darte acceso al portal y mostrarte el avance de tus proyectos</strong>: necesario para ejecutar el
                contrato de servicios que tienes con nosotros.
              </li>
              <li>
                <strong>Comunicarnos contigo sobre tus proyectos y servicios</strong>: ejecución del contrato.
              </li>
              <li>
                <strong>Mantener la seguridad del portal y prevenir accesos indebidos</strong>: interés legítimo de ProyIT y
                cumplimiento de nuestro deber de seguridad.
              </li>
              <li>
                <strong>Cumplir obligaciones legales</strong> (por ejemplo, tributarias o requerimientos de autoridad):
                obligación legal.
              </li>
            </ul>
            <p>
              No usamos tus datos para publicidad de terceros, no los vendemos y no tomamos decisiones automatizadas que te
              afecten.
            </p>
          </section>

          <section>
            <h2 id="encargados">4. Con quién los compartimos</h2>
            <p>
              Solo con proveedores que tratan datos por encargo nuestro y bajo nuestras instrucciones (encargados del
              tratamiento), para que el portal funcione:
            </p>
            <ul>
              <li>
                <strong>Supabase</strong>: base de datos, autenticación y almacenamiento de documentos.
              </li>
              <li>
                <strong>Vercel</strong>: alojamiento y entrega del sitio web.
              </li>
              <li>
                <strong>Google</strong>: solo si eliges ingresar con tu cuenta de Google.
              </li>
              <li>
                <strong>Cloudflare (Turnstile)</strong>: verificación anti-bots al ingresar o registrarte. Procesa datos
                técnicos de tu navegador y tu dirección IP solo para confirmar que eres una persona; no usa cookies de
                seguimiento.
              </li>
            </ul>
            <p>
              Dentro de cada cliente, los proyectos y documentos solo los ven las personas que ese cliente autorizó y el
              equipo de ProyIT.
            </p>
          </section>

          <section>
            <h2 id="transferencias">5. Transferencias internacionales</h2>
            <p>
              Los servidores de nuestros proveedores están en los Estados Unidos, por lo que tus datos se transfieren fuera
              de Chile. Estas transferencias se realizan con proveedores que ofrecen garantías de protección mediante
              cláusulas contractuales y medidas de seguridad como cifrado en tránsito y en reposo.
            </p>
          </section>

          <section>
            <h2 id="conservacion">6. Cuánto tiempo los guardamos</h2>
            <ul>
              <li>Datos de cuenta y de clientes: mientras exista la relación comercial y hasta 2 años después de su término.</li>
              <li>Proyectos y documentos: durante la relación comercial y el plazo de garantía del servicio.</li>
              <li>Registros de seguridad y auditoría: hasta 2 años.</li>
              <li>
                Información que debamos mantener por ley (por ejemplo, tributaria): por el plazo que esa ley establezca.
              </li>
            </ul>
            <p>Cumplidos estos plazos, eliminamos o anonimizamos los datos.</p>
          </section>

          <section>
            <h2 id="seguridad">7. Cómo los protegemos</h2>
            <ul>
              <li>Conexiones cifradas (HTTPS) y datos cifrados en reposo por nuestros proveedores.</li>
              <li>
                Control de acceso por usuario: cada persona solo ve la información de los clientes a los que está
                autorizada.
              </li>
              <li>Documentos en almacenamiento privado, descargables solo mediante enlaces temporales.</li>
              <li>Cierre automático de sesión por inactividad y registro de auditoría de los cambios.</li>
              <li>Verificación anti-bots en el ingreso y el registro para prevenir accesos automatizados.</li>
              <li>
                Si ocurre una vulneración de seguridad que afecte tus datos, la notificaremos a la Agencia de Protección de
                Datos Personales y, cuando corresponda, a ti, sin dilaciones indebidas.
              </li>
            </ul>
          </section>

          <section>
            <h2 id="derechos">8. Tus derechos y cómo ejercerlos</h2>
            <p>Como titular de tus datos tienes derecho a:</p>
            <ul>
              <li>
                <strong>Acceso:</strong> saber qué datos tuyos tratamos, para qué y con quién los compartimos.
              </li>
              <li>
                <strong>Rectificación:</strong> corregir datos inexactos o incompletos.
              </li>
              <li>
                <strong>Supresión:</strong> pedir que eliminemos tus datos cuando ya no sean necesarios o no exista base
                legal para tratarlos.
              </li>
              <li>
                <strong>Oposición:</strong> oponerte a tratamientos basados en nuestro interés legítimo.
              </li>
              <li>
                <strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común.
              </li>
              <li>
                <strong>Bloqueo:</strong> pedir la suspensión temporal del tratamiento mientras resolvemos tu solicitud.
              </li>
            </ul>
            <p>
              Puedes ejercerlos desde <strong>Mis datos</strong> en el portal (donde además puedes descargar tus datos) o
              escribiendo a <strong>{RESPONSABLE.emailPrivacidad}</strong>. Responderemos dentro de <strong>30 días
              corridos</strong>, plazo que podremos extender por otros 30 días informándote el motivo. Ejercer estos
              derechos es gratuito.
            </p>
            <p>
              Si no respondemos o no estás conforme con la respuesta, puedes reclamar ante la{" "}
              <strong>Agencia de Protección de Datos Personales</strong>.
            </p>
          </section>

          <section>
            <h2 id="cookies">9. Cookies</h2>
            <p>
              El portal usa solo cookies estrictamente necesarias para mantener tu sesión iniciada de forma segura. No
              usamos cookies de publicidad ni de analítica de terceros.
            </p>
          </section>

          <section>
            <h2 id="cambios">10. Cambios a esta política</h2>
            <p>
              Si modificamos esta política de forma relevante, te lo informaremos en el portal y te pediremos revisarla
              antes de seguir usándolo. La versión vigente siempre estará disponible en esta página.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
