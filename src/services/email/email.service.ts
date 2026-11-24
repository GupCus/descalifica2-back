function parseSender(fromStr?: string): { name: string; email: string } {
  const defaultSender = {
    name: 'Descalifica2',
    email: 'ignaciotaborda2014@gmail.com',
  };

  if (!fromStr) return defaultSender;

  const match = fromStr.match(/^(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)$/);
  if (match) {
    return {
      name: match[1]?.trim() || defaultSender.name,
      email: match[2]?.trim() || defaultSender.email,
    };
  }

  return { name: defaultSender.name, email: fromStr };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  // Prioridad 1: Brevo HTTP API (Puerto 443 HTTPS - 100% inmune a bloqueos de puertos en Railway)
  const brevoApiKey =
    process.env.BREVO_API_KEY ||
    (process.env.SMTP_PASS?.startsWith('xkeysib-')
      ? process.env.SMTP_PASS
      : undefined);

  if (!brevoApiKey) {
    throw new Error(
      '[EmailService] No se encontró la variable BREVO_API_KEY configurada.',
    );
  }

  try {
    console.log(
      '[EmailService] Enviando correo mediante Brevo HTTP API (HTTPS)...',
    );
    const sender = parseSender(process.env.EMAIL_FROM);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(
        `Error ${response.status} en Brevo API: ${JSON.stringify(errJson)}`,
      );
    }

    const result = await response.json();
    console.log(`📧 Correo enviado con éxito (vía Brevo API) a: ${to}`, result);
    return result;
  } catch (apiError: any) {
    console.error(
      '[EmailService] Falló el envío por Brevo API:',
      apiError.message || apiError,
    );
    throw apiError;
  }
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  const safeResetUrl = escapeHtml(resetUrl);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; color: #ffffff; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #e10600; margin: 0; font-size: 26px;">Descalifica2</h1>
        <p style="color: #a0a0a0; font-size: 14px;">Recuperación de contraseña</p>
      </div>
      <div style="background-color: #262626; padding: 24px; border-radius: 6px; border: 1px solid #333333;">
        <p style="font-size: 16px; line-height: 1.5; color: #e0e0e0;">
          Hola, recibimos una solicitud para restablecer la contraseña de tu cuenta.
        </p>
        <p style="font-size: 14px; color: #a0a0a0;">
          Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace expira en <strong>15 minutos</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${safeResetUrl}" style="background-color: #e10600; color: #ffffff; text-decoration: none; padding: 12px 28px; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 15px;">
            Restablecer Contraseña
          </a>
        </div>
        <p style="font-size: 12px; color: #777777; line-height: 1.4;">
          Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br/>
          <a href="${safeResetUrl}" style="color: #e10600; word-break: break-all;">${safeResetUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #333333; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777777; margin: 0;">
          Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña no cambiará.
        </p>
      </div>
    </div>
  `;

  const text = `Recibimos una solicitud para restablecer tu contraseña en Descalifica2. Visita el siguiente enlace para continuar (expira en 15 minutos): ${resetUrl}`;

  return sendEmail({
    to,
    subject: 'Recuperación de contraseña - Descalifica2',
    html,
    text,
  });
}

export async function sendPasswordChangedEmail({
  to,
  username,
  changedAt,
  ipAddress,
}: {
  to: string;
  username: string;
  changedAt: Date;
  ipAddress?: string;
}) {
  const safeUsername = escapeHtml(username);
  const formattedDate = changedAt.toISOString();
  const safeIp = ipAddress ? escapeHtml(ipAddress) : 'No disponible';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; color: #ffffff; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #e10600; margin: 0; font-size: 26px;">Descalifica2</h1>
        <p style="color: #a0a0a0; font-size: 14px;">Aviso de seguridad</p>
      </div>
      <div style="background-color: #262626; padding: 24px; border-radius: 6px; border: 1px solid #333333;">
        <p style="font-size: 16px; line-height: 1.5; color: #e0e0e0;">
          Hola <strong>${safeUsername}</strong>, te confirmamos que la contraseña de tu cuenta fue modificada.
        </p>
        <p style="font-size: 14px; color: #a0a0a0; line-height: 1.5;">
          Por seguridad, <strong>todas tus sesiones y tokens activos fueron cerrados</strong>. Deberás iniciar sesión nuevamente con tu nueva contraseña.
        </p>
        <p style="font-size: 13px; color: #999999;">
          Fecha y hora (UTC): ${escapeHtml(formattedDate)}<br/>
          Dirección IP: ${safeIp}
        </p>
        <hr style="border: none; border-top: 1px solid #333333; margin: 20px 0;" />
        <p style="font-size: 12px; color: #e10600; margin: 0;">
          Si no realizaste este cambio, recuperá tu cuenta inmediatamente desde la opción "¿Olvidaste tu contraseña?" o contactá a un administrador.
        </p>
      </div>
    </div>
  `;

  const text = `Hola ${username}, la contraseña de tu cuenta en Descalifica2 fue cambiada el ${formattedDate} (IP: ${ipAddress || 'No disponible'}). Todas tus sesiones activas fueron invalidadas. Si no fuiste vos, recuperá tu cuenta inmediatamente.`;

  return sendEmail({
    to,
    subject: 'Tu contraseña fue modificada - Descalifica2',
    html,
    text,
  });
}

export async function sendAdminPasswordResetEmail({
  to,
  username,
  temporaryPassword,
  reason,
  resetAt,
}: {
  to: string;
  username: string;
  temporaryPassword: string;
  reason?: string;
  resetAt: Date;
}) {
  const safeUsername = escapeHtml(username);
  const safeTempPassword = escapeHtml(temporaryPassword);
  const safeReason = reason ? escapeHtml(reason) : undefined;
  const formattedDate = resetAt.toISOString();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; color: #ffffff; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #e10600; margin: 0; font-size: 26px;">Descalifica2</h1>
        <p style="color: #a0a0a0; font-size: 14px;">Restablecimiento administrativo de contraseña</p>
      </div>
      <div style="background-color: #262626; padding: 24px; border-radius: 6px; border: 1px solid #333333;">
        <p style="font-size: 16px; line-height: 1.5; color: #e0e0e0;">
          Hola <strong>${safeUsername}</strong>, un administrador restableció la contraseña de tu cuenta.
        </p>
        <p style="font-size: 14px; color: #a0a0a0; line-height: 1.5;">
          Todas tus sesiones anteriores fueron cerradas. Para volver a ingresar, utilizá la siguiente contraseña temporal. <strong>El sistema te exigirá cambiarla obligatoriamente en tu próximo ingreso.</strong>
        </p>
        <div style="background-color: #1a1a1a; border: 1px solid #444444; padding: 14px; text-align: center; border-radius: 4px; margin: 20px 0; font-family: monospace; font-size: 18px; letter-spacing: 1px; color: #ffffff;">
          ${safeTempPassword}
        </div>
        ${
          safeReason
            ? `<p style="font-size: 13px; color: #a0a0a0;">Motivo informado: ${safeReason}</p>`
            : ''
        }
        <p style="font-size: 12px; color: #777777;">
          Fecha y hora (UTC): ${escapeHtml(formattedDate)}
        </p>
      </div>
    </div>
  `;

  const text = `Hola ${username}, un administrador restableció tu contraseña en Descalifica2 (${formattedDate}). Todas tus sesiones anteriores fueron invalidadas. Tu contraseña temporal es: ${temporaryPassword}. Deberás cambiarla obligatoriamente en tu próximo ingreso.${reason ? ` Motivo: ${reason}` : ''}`;

  return sendEmail({
    to,
    subject: 'Restablecimiento administrativo de contraseña - Descalifica2',
    html,
    text,
  });
}
