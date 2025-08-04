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


import express from 'express'
import 'reflect-metadata'
import { escuderiaRouter } from './escuderia/escuderia.routes.js';
import { pilotoRouter } from './piloto/piloto.routes.js';
import { carreraRouter } from './carrera/carrera.router.js';
import { orm,syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { circuitoClassRouter } from './circuito/circuitoClass.routes.js';

const app = express();

//Middleware para poder leer paquetes json
app.use(express.json())

//Bootstrap 
app.use((req,res,next) =>{
  RequestContext.create(orm.em,next)
});

//Handler de routeo
app.use('/api/pilotos',pilotoRouter)
app.use('/api/escuderias',escuderiaRouter)
<<<<<<< HEAD
app.use('/api/carreras',carreraRouter)
=======
app.use('/api/circuitos/clases',circuitoClassRouter)
>>>>>>> 980f635f0d99e651f48435859692081824e36e00

//Repuesta default para cualquier unhandled request
app.use((_,res) => {
  res.status(404).send({ message: 'Recurso no encontrado.' })
})

//SOLO EN DESARROLLO, ELIMINAR DESPUES ; Espero a que mikroORM se ponga al dia con la BD
await syncSchema()

app.listen(3000, () => {
    console.log('Corriendo en http://localhost:3000');
})