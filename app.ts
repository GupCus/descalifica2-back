//Recordar el pnpm install para los módulos
//No hace falta hacer nada, ya lo acomodé pero como estamos utilizando Express@4 al instalar los tipos tenemos que instalar pnpm add -D @types/express@4
//Tener correctamente configurado fnm en la terminal donde abrimos vscode (seguramente el bash de git además de powershell, sino no van a funcionar los comandos de node y npm)
//Primero buildear y despues start:dev
//los import, como el de character agregarle .js al final o va a lanzar error de que no lo encuentra(me pelee con copilot por esto como por 2h)

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
3. Ejecuta en orden:
   - pnpm install
   - pnpm start:dev

¿Solución para "NODE NO ES UN COMANDO RECONOCIDO" o similar?
- Asegurate de tener fnm correctamente configurado en la terminal desde donde abrís VS Code (cuando haces code . desde bash de git y powershell). Si no, los comandos de node y npm no sirven.

¿No encuentra definiciones de clases o funciones?
- Revisa los imports: agrega .js al final (por ejemplo, import { Character } from './character.js'). Si no lo haces, aparece módulo no encontrado. (Me pelee con copilot 2h pq no entendia esto)

---------------------------------
Sentite libre de agregar otro problema q te tuvo mal - Agus
*/

import "reflect-metadata";
import express from "express";
import cors from "cors";
import { pilotoRouter } from "./src/piloto/piloto.routes.js";
import { escuderiaRouter } from "./src/escuderia/escuderia.routes.js";
import { orm, syncSchema } from "./src/shared/db/orm.js";
import { RequestContext } from "@mikro-orm/core";
import { categoriaRouter } from "./src/categoria/categoria.routes.js";
import { temporadaRouter } from "./src/temporada/temporada.routes.js";
import { carreraRouter } from "./src/carrera/carrera.router.js";
import { marcaRouter } from "./src/marca/marca.router.js";
import { circuitoRouter } from "./src/circuito/circuito.routes.js";
import { usuarioRouter } from "./src/usuario/usuario.routes.js";
import { sesionRouter } from "./src/sesion/sesion.routes.js";
import { blogpostRouter } from "./src/blogpost/blogpost.routes.js";

const app = express();

app.use(cors());

//Middleware para poder leer paquetes json
app.use(express.json());

//antes

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});
//despues

//Handler de routeo
app.use("/api/usuarios", usuarioRouter);
app.use("/api/pilotos", pilotoRouter);
app.use("/api/escuderias", escuderiaRouter);
app.use("/api/categorias", categoriaRouter);
app.use("/api/temporadas", temporadaRouter);
app.use("/api/carreras", carreraRouter);
app.use("/api/marcas", marcaRouter);
app.use("/api/circuitos", circuitoRouter);
app.use("/api/sesion", sesionRouter);
app.use("/api/blogposts", blogpostRouter);

//Repuesta default para cualquier unhandled request
app.use((_, res) => {
  res.status(404).send({ message: "Recurso no encontrado." });
});

await syncSchema();

app.listen(3000, () => {
  console.log("Corriendo en http://localhost:3000");
});
