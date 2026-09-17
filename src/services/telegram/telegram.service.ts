import { Bot } from 'node-telegram-bot-api';
import { run } from 'node-telegram-bot-api/node';
import { orm } from '../../shared/db/orm.js';
import 'dotenv/config';
import { Usuario } from '../../usuario/usuario.entity.js';
import { Blogpost } from '../../blogpost/blogpost.entity.js';
import { Sesion } from '../../sesion/sesion.entity.js';
import { Reference } from '@mikro-orm/core';

export interface PendingRegistration {
  vinculado: boolean;
  chatId?: string;
  telegramUsername?: string;
  expiresAt: number;
  error?: string;
}

export const pendingRegistrationLinks = new Map<string, PendingRegistration>();

const bot = new Bot(process.env.TELEGRAM_BOT!);

bot.command('start', async (ctx) => {
  if (ctx.message?.text && ctx.chat) {
    const partes = ctx.message.text.split(' ');

    if (partes.length === 2) {
      const codigo = partes[1];
      const chatId = ctx.chat.id;
      const tgUsername = ctx.from?.username || null;

      const em = orm.em.fork();

      // 1. Verificar si corresponde a un código temporal de registro
      const pendingReg = pendingRegistrationLinks.get(codigo);
      if (pendingReg) {
        if (pendingReg.expiresAt < Date.now()) {
          pendingReg.error = 'El código de vinculación ha expirado.';
          await ctx.reply(
            '❌ Este código de vinculación ha expirado. Por favor, genera uno nuevo en la página de registro.',
          );
          return;
        }

        const existeChatId = await em.findOne(Usuario, {
          telegram_id: chatId.toString(),
        });

        if (existeChatId) {
          pendingReg.error =
            'Esta cuenta de Telegram ya está vinculada a otro usuario.';
          await ctx.reply(
            '❌ Esta cuenta de Telegram ya está vinculada a otro usuario de Descalifica2.',
          );
          return;
        }

        if (tgUsername) {
          const existeTgUser = await em.findOne(Usuario, {
            telegram_username: tgUsername,
          });

          if (existeTgUser) {
            pendingReg.error = `El usuario de Telegram @${tgUsername} ya está en uso por otra cuenta.`;
            await ctx.reply(
              `❌ Ya existe una cuenta con el nombre de usuario de Telegram @${tgUsername}.`,
            );
            return;
          }
        }

        pendingReg.chatId = chatId.toString();
        pendingReg.telegramUsername = tgUsername || undefined;
        pendingReg.vinculado = true;

        await ctx.reply(
          '¡Cuenta vinculada con éxito! Ya puedes volver a la página web y completar tu registro.',
        );
        await ctx.reply(
          'Próximamente recibirás noticias a través de este canal 🏎️🏎️',
        );
        return;
      }

      // 2. Verificar si corresponde a un usuario ya existente
      const usuario = await em.findOne(Usuario, { telegram_id: codigo });

      if (usuario) {
        const existeChatId = await em.findOne(Usuario, {
          telegram_id: chatId.toString(),
          id: { $ne: usuario.id },
        });

        if (existeChatId) {
          await ctx.reply(
            '❌ Esta cuenta de Telegram ya está vinculada a otro usuario de Descalifica2.',
          );
          return;
        }

        if (tgUsername) {
          const existeTgUser = await em.findOne(Usuario, {
            telegram_username: tgUsername,
            id: { $ne: usuario.id },
          });

          if (existeTgUser) {
            await ctx.reply(
              `❌ Ya existe una cuenta con el nombre de usuario de Telegram @${tgUsername}.`,
            );
            return;
          }
        }

        usuario.telegram_id = chatId.toString();
        usuario.telegram_username = tgUsername || undefined;
        await em.flush();
        await ctx.reply(
          '¡Cuenta vinculada con éxito! Ya puedes volver a la página web.',
        );
        await ctx.reply(
          'Proximamente recibirás noticias a través de este canal 🏎️🏎️',
        );
      }
    }
  }
});

export async function enviarNotificacionSesion(sesionId: number) {
  const em = orm.em.fork();
  const sesion = await em.findOne(
    Sesion,
    { id: sesionId },
    { populate: ['race'] },
  );

  if (!sesion || sesion.notificado_30min) return;

  const hora = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(sesion.start_time);

  const carrera = Reference.unwrapReference(sesion.race);
  const mensaje = `🏁 ¡Atención! La "${sesion.name}" del ${carrera.name} comenzará a las ${hora}.\n\n`;
  await enviarMensajeMasivo(mensaje);
  sesion.notificado_30min = true;
  await em.flush();
  console.log(`Notificación enviada para la sesión ${sesionId}.`);
}

//Funcion para enviar posts de interes a usuarios
export async function enviarMensajeMasivo(mensaje: string) {
  const em = orm.em.fork();

  // Traemos todos los usuarios que tengan guardado telegram_id
  const usuarios = await em.find(Usuario, { telegram_id: { $ne: null } });
  const destinos = usuarios.filter((u) => u.telegram_id);

  console.log('Iniciando envío masivo a ' + destinos.length + ' usuarios...');

  //Telegram nos permite mandar hasta 30msg distintos x segundo
  for (let i = 0; i < destinos.length; i += 30) {
    const tanda = destinos.slice(i, i + 30);

    // invocamos la API
    const promesas = tanda.map((usuario) =>
      bot.api.sendMessage({
        chat_id: usuario.telegram_id!,
        text: mensaje,
      }),
    );

    await Promise.allSettled(promesas);

    // Si quedan más, mandamos un segundo de delay
    if (i + 30 < destinos.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('Envío masivo finalizado.');
}

export async function verificarSesionesProximas() {
  const em = orm.em.fork();
  const ahora = new Date();
  const en30min = new Date(ahora.getTime() + 30 * 60 * 1000);

  const sesiones = await em.find(
    Sesion,
    {
      start_time: { $gt: ahora, $lt: en30min },
      notificado_30min: false,
    },
    { populate: ['race'] },
  );
  for (const s of sesiones) {
    await enviarNotificacionSesion(s.id!);
  }
}
//Variable para saber si el apagado fue voluntario y no seguir reintentando
let debeDetenerse = false;

// Arranca el bot con tolerancia a fallos y reintentos en caso de conflicto 409
export async function iniciarBotTelegram(
  maxIntentos = 5,
  delayInicialMs = 3000,
) {
  debeDetenerse = false;
  let intento = 1;
  let delay = delayInicialMs;

  while (intento <= maxIntentos && !debeDetenerse) {
    try {
      console.log(
        `Conectando bot de Telegram (intento ${intento}/${maxIntentos})...`,
      );
      await run(bot);
      break;
    } catch (error: any) {
      if (debeDetenerse) break;

      // Verificamos si es el típico error 409 Conflict de Telegram
      const esConflicto409 =
        error?.errorCode === 409 ||
        error?.message?.includes('409') ||
        error?.message?.includes('Conflict');

      if (esConflicto409 && intento < maxIntentos) {
        console.warn(
          `⚠ [Telegram 409 Conflict]: La conexión anterior aún se está liberando en Telegram. ` +
            `Esperando ${Math.round(delay / 1000)}s antes de reintentar (intento ${intento}/${maxIntentos})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        intento++;
        delay *= 1.5;
      } else {
        console.error(
          '❌ Error no recuperable al iniciar el bot de Telegram:',
          error,
        );
        break;
      }
    }
  }
}

//Funcion para enviar el post más comentado de la semana
export async function enviarTopPostSemanal() {
  const em = orm.em.fork();

  // Fecha hace 7 días
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);

  // Buscar el blogpost con más comentarios de la última semana (raw SQL)
  const resultado = (await em
    .getConnection()
    .execute(
      `SELECT blogpost_id, COUNT(*) as total FROM comentario_post WHERE created_at >= ? GROUP BY blogpost_id ORDER BY total DESC LIMIT 1`,
      [hace7Dias],
    )) as { blogpost_id: number; total: number }[];

  if (!resultado.length || resultado[0].total === 0) {
    console.log('No hay posts con comentarios esta semana. No se envía nada.');
    return;
  }

  const blogpostId = resultado[0].blogpost_id;

  const blogpost = await em.findOne(Blogpost, { id: blogpostId });

  if (!blogpost) {
    console.log('No se encontró el blogpost.');
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // despues se pone el link de la pagina
  const mensaje =
    `🏁 ¡Post destacado de la semana!\n\n` +
    `👀 ¡Pasa a echar un vistazo!\n\n` +
    `📝 ${blogpost.title}\n` +
    `👉 ${frontendUrl}/blog/${blogpost.id}`;

  await enviarMensajeMasivo(mensaje);
}
// Función para detener el bot de forma limpia (Paso 1)
export function detenerBotTelegram() {
  debeDetenerse = true;
  if (bot.isRunning()) {
    bot.stop();
    console.log('🛑 Bot de Telegram detenido limpiamente.');
  }
}
