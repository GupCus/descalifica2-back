//Recordar el pnpm install para los módulos
//No hace falta hacer nada, ya lo acomodé pero como estamos utilizando Express@4 al instalar los tipos tenemos que instalar pnpm add -D @types/express@4
//Tener correctamente configurado fnm en la terminal donde abrimos vscode (seguramente el bash de git además de powershell, sino no van a funcionar los comandos de node y npm)
//Primero buildear y despues start:dev
//los import, como el de character agregarle .js al final o va a lanzar error de que no lo encuentra(me pelee con copilot por esto como por 2h)

import express, { NextFunction, Request, Response } from 'express'
import { Piloto } from './piloto.js'
import cors from 'cors'

const app = express()  //PRUEBAS, si no pongo estas líneas el front me tira que el back lo saca cagando
app.use(cors())        //son necesarias para que el back acepte peticiones de otros orígenes.

app.use(express.json())

const pilotos = [
    new Piloto(
        'Franco Colapinto',
        'Alpine',
        43,
        'Argentino',
        'Segundo piloto',
        '2f6cb93c-1d73-4b1e-90b1-2d50e439084f'
    )
]

function sanitizePilotoInput(req: Request, res: Response, next: NextFunction){ //Response, Request y NextFunction son de express
    req.body.sanitizedInput = {
        name: req.body.name,
        team: req.body.team,
        nro: req.body.nro,
        nationality: req.body.nationality,
        role: req.body.role,
    }
     Object.keys(req.body.sanitizedInput).forEach(key => { //borra todos los atributos que no nos pasaron en el PATCH, evitamos errores
        if(req.body.sanitizedInput[key] === undefined){delete req.body.sanitizedInput[key]}
     })
    next()
}

app.get('/api/pilotos',(req,res)=>{ //get todos los pilotos
    res.status(200).send({message: 'Pilotos', data: pilotos})
})

app.get('/api/pilotos/:id', (req,res) => { //get para un piloto en específico
    const Persona = pilotos.find((p) => p.id === req.params.id)
    if(!Persona){ //if persona es un undefined (no lo encontró)
        res.status(404).send({message: 'Piloto no encontrado.'})
    }
    res.status(200).send({message: 'Piloto', data: Persona})
})

app.post('/api/pilotos/', sanitizePilotoInput, (req,res) => { //post un nuevo piloto
    const {name, team, nro, nationality, role} = req.body.sanitizedInput //utilizo la input sanitizada

    const piloto = new Piloto(name, team, nro, nationality, role)

    pilotos.push(piloto) //añade el piloto nuevo al final del array 'pilotos'
    res.status(201).send({message: 'Piloto creado correctamente.', data: piloto})
})

app.put('/api/pilotos/:id', sanitizePilotoInput, (req,res) => { //put de piloto
    const PilotoIdx = pilotos.findIndex((p) => p.id === req.params.id) // .findIndex devuelve la posición en el array del piloto con el id
    
    if(PilotoIdx == -1){
        res.status(404).send({message: 'Character not found.'})
    }

    pilotos[PilotoIdx] = {...pilotos[PilotoIdx], ...req.body.sanitizedInput} // Modifica el objeto en la pos PilotoIdx, pisa el piloto en PilotoIdx con los introducidos que fueron sanitizados previamente

    res.status(200).send({ message: 'Character modificado correctamente.', data: pilotos[PilotoIdx]})
})

app.patch('/api/pilotos/:id', sanitizePilotoInput, (req,res) => { //put de piloto
    const PilotoIdx = pilotos.findIndex((p) => p.id === req.params.id) // .findIndex devuelve la posición en el array del piloto con el id
    
    if(PilotoIdx == -1){
        res.status(404).send({message: 'Character not found.'})
    }

    pilotos[PilotoIdx] = {...pilotos[PilotoIdx], ...req.body.sanitizedInput} // Modifica el objeto en la pos PilotoIdx, pisa el piloto en PilotoIdx con los introducidos que fueron sanitizados previamente

    res.status(200).send({ message: 'Character modificado correctamente.', data: pilotos[PilotoIdx]})
})

app.delete('/api/pilotos/:id', (req,res) => { //no necesita sanitizacion ya que no hay body
    const PilotoIdx = pilotos.findIndex((p) => p.id === req.params.id)

    if(PilotoIdx=== -1){
        res.status(404).send({message: 'Piloto no encontrado.'})
    }else{
        pilotos.splice(PilotoIdx, 1)
        res.status(200).send({message: 'Piloto borrado correctamente.'})
    }
})

app.use((_,res) => {
  res.status(404).send({ message: 'Página no encontrada.' })
})

app.listen(3000, () => {
    console.log('Corriendo en http://localhost:3000');
})