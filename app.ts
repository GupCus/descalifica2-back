/* 

¿Tenés algun problema y viniste acá por qué no se te ocurre que hacer?

==========================
    Q&A PARA EL EQUIPO
==========================

¿El proyecto funciona en otra compu pero no en la tuya?
1. Verifica que tu copia local esté igual al repo remoto:
   - Si no teenes commits locales: git restore .
   - Si tenes commits locales: git fetch y git reset --hard
2. Borra las carpetas /dist y node_modules
3. ACORDATE DE CHEQUEAR SI TENES .ENV AL DIA !!!!
4. Ejecuta en orden:
   - pnpm install
   - pnpm start:dev

¿Solución para "NODE NO ES UN COMANDO RECONOCIDO" o similar?
- Asegurate de tener fnm correctamente configurado en la terminal desde donde abrís VS Code (cuando haces code . desde bash de git y powershell). Si no, los comandos de node y npm no sirven.

¿No encuentra definiciones de clases o funciones?
- Revisa los imports: agrega .js al final (por ejemplo, import { Character } from './character.js'). Si no lo haces, aparece módulo no encontrado. (Me pelee con copilot 2h pq no entendia esto)

---------------------------------
Sentite libre de agregar otro problema q te tuvo mal - Agus
*/

//Agrego esto para que se den cuenta cuando les falta el env !!
import 'dotenv/config';
if (
  !process.env.TELEGRAM_BOT ||
  !process.env.GOOGLE_KEY ||
  !process.env.BDLOCATION ||
  !process.env.JWT_SECRET ||
  !process.env.PORT ||
  !process.env.BREVO_API_KEY
) {
  console.error('Te falta el env o lo tenes incompleto');
  process.exit();
}

import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { pilotoRouter } from './src/piloto/piloto.routes.js';
import { escuderiaRouter } from './src/escuderia/escuderia.routes.js';
import { orm, syncSchema } from './src/shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { categoriaRouter } from './src/categoria/categoria.routes.js';
import { temporadaRouter } from './src/temporada/temporada.routes.js';
import { carreraRouter } from './src/carrera/carrera.router.js';
import { marcaRouter } from './src/marca/marca.router.js';
import { circuitoRouter } from './src/circuito/circuito.routes.js';
import { usuarioRouter } from './src/usuario/usuario.routes.js';
import { sesionRouter } from './src/sesion/sesion.routes.js';
import { blogpostRouter } from './src/blogpost/blogpost.routes.js';
import { authRouter } from './src/auth/auth.routes.js';
import { of1router } from './src/services/openf1/openf1.routes.js';
import { actualizarresultados } from './src/services/openf1/openf1.service.js';
import { assetRouter } from './src/asset/asset.routes.js';
import { nationalityRouter } from './src/shared/nationalities.routes.js';
import { comentarioRouter } from './src/comentariopost/comentario.routes.js';
import {
  iniciarBotTelegram,
  detenerBotTelegram,
} from './src/services/telegram/telegram.service.js';
import { telegramrouter } from './src/services/telegram/telegram.routes.js';
import { championshipRouter } from './src/championship/championship.routes.js';
import { iniciarCronJobs } from './src/services/cron/cron.service.js';
import { handleMulterErrors } from './src/shared/upload/upload.middleware.js';
import fs from 'node:fs';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';

//Express + cors + middleware p/ leer json
const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

//Rutas API
app.use('/api/usuarios', usuarioRouter);
app.use('/api/pilotos', pilotoRouter);
app.use('/api/escuderias', escuderiaRouter);
app.use('/api/categorias', categoriaRouter);
app.use('/api/temporadas', temporadaRouter);
app.use('/api/carreras', carreraRouter);
app.use('/api/marcas', marcaRouter);
app.use('/api/circuitos', circuitoRouter);
app.use('/api/sesion', sesionRouter);
app.use('/api/blogposts', blogpostRouter);
app.use('/api/auth', authRouter);
app.use('/api/openf1', of1router);
app.use('/api/assets', assetRouter);
app.use('/api/comentarios', comentarioRouter);
app.use('/api/telegram', telegramrouter);
app.use('/api/championship', championshipRouter);
app.use('/api/nationalities', nationalityRouter);

//Middleware de error para Multer (archivo muy grande, tipo no permitido, etc.)
app.use(handleMulterErrors);

// Documentación Swagger
const swaggerFilePath = path.resolve(
  process.cwd(),
  'src/shared/swagger/swagger-output.json',
);
// Si existe el json del swagger, deja abierto el endpoint /api/docs
if (fs.existsSync(swaggerFilePath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf8'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.warn(
    'No se encontró swagger-output.json. Ejecutá el script de swagger para generarlo. No va a funcionar swagger hasta entonces.',
  );
}

//Repuesta default para cualquier unhandled request
app.use((_, res) => {
  res.status(404).send({ message: 'Recurso no encontrado.' });
});

//Sincroniza la config de tablas esto es de DEV cuando este todo terminado hay que borrarlo
await syncSchema();

//Intenta actualizar los ultimos resultados, falla si hay una sesión en curso (no pagamos la api)
try {
  await actualizarresultados();
} catch (err) {
  console.warn(
    'No se pudo actualizar el último resultado, seguramente haya una sesión actualmente: ' +
      err,
  );
}
//Bot de telegram solo en prod, pq solo podemos tener una instancia activa
if (!process.argv.includes('--dev')) {
  iniciarBotTelegram();
}
iniciarCronJobs();

//Inicio del server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Corriendo en puerto ${port}`);
});

// Manejo de apagado del server
const apagarServidor = async (senal: string) => {
  console.log("Recibida señal ' " + senal + " '. Cerrando aplicación...");
  await detenerBotTelegram();
  process.exit(0);
};
process.on('SIGINT', () => apagarServidor('SIGINT'));
process.on('SIGTERM', () => apagarServidor('SIGTERM'));
