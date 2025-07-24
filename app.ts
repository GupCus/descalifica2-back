//Recordar el pnpm install para los módulos
//No hace falta hacer nada, ya lo acomodé pero como estamos utilizando Express@4 al instalar los tipos tenemos que instalar pnpm add -D @types/express@4
//Tener correctamente configurado fnm en la terminal donde abrimos vscode (seguramente el bash de git además de powershell, sino no van a funcionar los comandos de node y npm)
//Primero buildear y despues start:dev
//los import, como el de character agregarle .js al final o va a lanzar error de que no lo encuentra(me pelee con copilot por esto como por 2h)

import 'reflect-metadata'
import express from 'express'
import { pilotoRouter } from './src/piloto/piloto.routes.js';
import { escuderiaRouter } from './src/escuderia/escuderia.routes.js';
import { orm, syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';

const app = express();

//Middleware para poder leer paquetes json
app.use(express.json())

//antes

app.use((req,res,next)=>{
  RequestContext.create(orm.em, next)
})
//despues

//Handler de routeo
app.use('/api/pilotos',pilotoRouter)
app.use('/api/escuderias',escuderiaRouter)

//Repuesta default para cualquier unhandled request
app.use((_,res) => {
  res.status(404).send({ message: 'Recurso no encontrado.' })
})

await syncSchema()

app.listen(3000, () => {
    console.log('Corriendo en http://localhost:3000');
})