# Seguridad y protección de datos — Portal ProyIT

Documento interno de cumplimiento de la **Ley 19.628 modificada por la Ley 21.719**
(vigente desde el 1 de diciembre de 2026). Responsable: Inversiones Tesoros Chile SpA (ProyIT).
Revisar cada 6 meses o ante cualquier cambio relevante del portal.

> Este documento no reemplaza la revisión de un abogado. Validar la Política de Privacidad
> (`/privacidad`) y los contratos con encargados antes de operar con clientes reales.

## 1. Registro de actividades de tratamiento

| Actividad | Titulares | Datos | Base de licitud | Conservación |
|---|---|---|---|---|
| Cuentas del portal | Usuarios de clientes, equipo ProyIT | Nombre, correo, empresa, fecha de aceptación de la política | Ejecución del contrato | Relación comercial + 2 años |
| Fichas de clientes | Empresas y personas clientes, sus contactos | Razón social/nombre, RUT, giro, correo, teléfono, dirección, notas internas | Ejecución del contrato | Relación comercial + 2 años |
| Proyectos y documentos | Clientes | Etapas, hitos, bitácora, archivos | Ejecución del contrato | Relación comercial + garantía |
| Solicitudes de derechos | Titulares | Tipo, detalle, respuesta | Obligación legal | 2 años desde el cierre |
| Auditoría | Usuarios | Quién cambió qué tabla/columnas y cuándo (sin valores) | Interés legítimo (seguridad) | 2 años |

**No se tratan datos sensibles.** El formulario de notas lo advierte.

## 2. Encargados del tratamiento y transferencias internacionales

| Proveedor | Uso | Ubicación | Acción pendiente |
|---|---|---|---|
| Supabase | Base de datos, autenticación, archivos | EE.UU. (us-east-1) | Aceptar su DPA (Data Processing Addendum) desde el dashboard y guardar copia |
| Vercel | Hosting | EE.UU./global | Aceptar su DPA y guardar copia |
| Google | Ingreso con Google (opcional) | EE.UU. | Revisar términos de Google Cloud / OAuth |
| Cloudflare (Turnstile) | Captcha en ingreso y registro | Global | Revisar su DPA (incluido en los términos de Cloudflare) |

## 3. Medidas de seguridad implementadas

- **Control de acceso (RLS)** en todas las tablas: cada usuario solo ve los clientes a los que tiene acceso.
  Solo el rol `admin` escribe. Las funciones de permisos viven en el esquema `privado`, que la API no expone.
- **Escalamiento de privilegios bloqueado**: un usuario no puede cambiar su rol, su correo de perfil
  ni la fecha de aceptación de la política (trigger `prevent_role_change`).
- **Vinculación por correo confirmado**: un acceso a cliente solo se activa cuando el correo está verificado.
- **Documentos** en bucket privado, enlaces de descarga que vencen en 15 minutos y tipos de archivo permitidos
  (sin HTML/SVG/JS).
- **Encabezados HTTP**: CSP, `X-Frame-Options: DENY` (anti clickjacking), HSTS, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, sin `X-Powered-By`, y `no-store` en páginas con datos personales.
- **Captcha** (Cloudflare Turnstile) en ingreso y registro, validado por Supabase Auth (Attack Protection).
  Frena la prueba masiva de contraseñas y la creación automatizada de cuentas.
- **Sesiones**: cierre por inactividad (15 min en el panel admin, 30 min en el portal de clientes).
- **Mensajes por código**: la URL nunca lleva texto que se muestre en pantalla (evita suplantación de contenido).
- **Auditoría**: tabla `auditoria` registra altas, cambios (columnas) y bajas en clientes, accesos, notas,
  perfiles, documentos y solicitudes.
- **Derechos del titular**: `/portal/mis-datos` (ver, rectificar, descargar JSON, solicitar
  acceso/rectificación/supresión/oposición/portabilidad/bloqueo) y bandeja `/admin/solicitudes` con plazo de 30 días.
- **Transparencia**: Política de Privacidad versionada; aceptación obligatoria al registrarse y al cambiar la versión
  (`POLITICA_VERSION` en `src/lib/empresa.ts`).

## 4. Configuración pendiente en Supabase (dashboard)

1. **Authentication → Providers → Email**: activar *Leaked password protection* y fijar largo mínimo en 8.
2. **Authentication → Providers → Email**: confirmar que *Confirm email* está activo (hoy lo está).
3. **Authentication → Multi-Factor**: habilitar TOTP y activarlo en la cuenta del super usuario.
4. **Authentication → Rate limits**: revisar límites de envío de correos e intentos de ingreso.
5. **Project Settings → Add-ons / Backups**: confirmar respaldos diarios (plan Pro) o exportar respaldos manuales.

## 5. Procedimiento ante una vulneración de seguridad (brecha)

1. **Contener** (primeras horas): revocar sesiones (Supabase → Authentication → Users → *Sign out*),
   rotar claves si aplica, desactivar el acceso comprometido.
2. **Evaluar**: qué datos, cuántos titulares, desde cuándo. Revisar `auditoria` y los logs de Supabase/Vercel.
3. **Notificar a la Agencia de Protección de Datos Personales** por los medios más expeditos y sin dilaciones
   indebidas, describiendo la brecha, los datos afectados, las consecuencias y las medidas adoptadas.
4. **Notificar a los titulares afectados** cuando la brecha pueda afectarlos significativamente, con lenguaje claro
   y recomendaciones (p. ej. cambiar su contraseña).
5. **Registrar** el incidente (fecha, alcance, acciones, notificaciones) y conservar el registro.
6. **Corregir** la causa y actualizar este documento.

## 6. Atención de derechos

- Canal: `/portal/mis-datos` o el correo de privacidad definido en `src/lib/empresa.ts`.
- Plazo: 30 días corridos, prorrogables una vez por 30 días informando el motivo.
- **Supresión**: quitar los accesos del usuario en la ficha del cliente y eliminar el usuario en
  Supabase → Authentication → Users. Conservar solo lo que exija otra ley (p. ej. tributaria).
- Registrar la respuesta en la bandeja de solicitudes (queda en la auditoría).
