//Recordar el pnpm install para los módulos
//No hace falta hacer nada, ya lo acomodé pero como estamos utilizando Express@4 al instalar los tipos tenemos que instalar pnpm add -D @types/express@4
//Tener correctamente configurado fnm en la terminal donde abrimos vscode (seguramente el bash de git además de powershell, sino no van a funcionar los comandos de node y npm)
//Primero buildear y despues start:dev
//los import, como el de character agregarle .js al final o va a lanzar error de que no lo encuentra(me pelee con copilot por esto como por 2h)

import express from 'express'
import cors from 'cors'
import { pilotoRouter } from './piloto/piloto.routes.js'

const app = express()  //PRUEBAS, si no pongo estas líneas el front me tira que el back lo saca cagando
app.use(cors())        //son necesarias para que el back acepte peticiones de otros orígenes.
app.use(express.json())

app.use('/api/pilotos', pilotoRouter)

app.use((_,res) => {
  res.status(404).send({ message: 'Página no encontrada.' })
})

app.listen(3000, () => {
    console.log('Corriendo en http://localhost:3000');
})