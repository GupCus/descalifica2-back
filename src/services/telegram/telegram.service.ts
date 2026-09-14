import { Bot } from 'node-telegram-bot-api';
import { run } from 'node-telegram-bot-api/node';
import { orm } from '../../shared/db/orm.js';
import 'dotenv/config';
import { Usuario } from '../../usuario/usuario.entity.js';
import { Blogpost } from '../../blogpost/blogpost.entity.js';

const bot = new Bot(process.env.TELEGRAM_BOT!);

bot.command('start', async (ctx) => {
  if (ctx.message?.text && ctx.chat) {
    const partes = ctx.message.text.split(' ');

    if (partes.length === 2) {
      const codigo = partes[1];
      const chatId = ctx.chat.id;
      const tgUsername = ctx.from?.username || null;

      const em = orm.em.fork();

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

//Arranca el bot
export function iniciarBotTelegram() {
  run(bot).catch(console.error);
  console.log('Bot de Telegram iniciado');
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

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const mensaje =
    `🏁 ¡Post destacado de la semana!\n\n` +
    `👀 ¡Pasa a echar un vistazo!\n\n` +
    `📝 ${blogpost.title}\n` +
    `👉 ${frontendUrl}/blog/${blogpost.id}`;

  await enviarMensajeMasivo(mensaje);
}
