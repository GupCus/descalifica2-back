import { Bot } from "node-telegram-bot-api";
import { run } from "node-telegram-bot-api/node";
import { orm } from "../../shared/db/orm.js";
import "dotenv/config";
import { Usuario } from "../../usuario/usuario.entity.js";

const bot = new Bot(process.env.TELEGRAM_BOT!);

bot.command("start", async (ctx) => {
  if (ctx.message?.text && ctx.chat) {
    const partes = ctx.message.text.split(" ");

    if (partes.length === 2) {
      const codigo = partes[1];
      const chatId = ctx.chat.id;

      const em = orm.em.fork();

      const usuario = await em.findOne(Usuario, { telegram_id: codigo });

      if (usuario) {
        usuario.telegram_id = chatId.toString();
        await em.flush();
        await ctx.reply(
          "¡Cuenta vinculada con éxito! Ya puedes volver a la página web.",
        );
        await ctx.reply(
          "Proximamente recibirás noticias a través de este canal 🏎️🏎️",
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

  console.log("Iniciando envío masivo a " + destinos.length + " usuarios...");

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

  console.log("Envío masivo finalizado.");
}

//Arranca el bot
export function iniciarBotTelegram() {
  run(bot).catch(console.error);
  console.log("Bot de Telegram iniciado");
}
