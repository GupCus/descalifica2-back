//Recordar el pnpm install para los módulos
//No hace falta hacer nada, ya lo acomodé pero como estamos utilizando Express@4 al instalar los tipos tenemos que instalar pnpm add -D @types/express@4

//Primero buildear y despues start:dev
//los import, como el de character agregarle .js al final o va a lanzar error de que no lo encuentra(me pelee con copilot por esto como por 2h)

import express, { NextFunction, Request, Response } from 'express'
import { Character } from './character.js'


const characters = [
    new Character(
      'Darth Vader',
      'Sith',
      10,
      100,
      20,
      10,
      ['Lightsaber', 'Death Star'],
      'a02b91bc-3769-4221-beb1-d7a3aeba7dad'
    ),
  ]

const app = express();

app.use(express.json())

app.get('/api/characters', (req: Request, res: Response) => {
    res.json({ data: characters })
})

app.get('/api/characters/:id', (req, res) => {
  const character = characters.find(c => c.id === req.params.id)
  if(!character){
    return res.status(404).json({ message: 'Character not found' })
  }
  res.json({ data: character })
})


app.use((_,res) => {
  return res.status(404).send({ message: 'Not Found' })
})

app.listen(3000,()=>{
    console.log('Corriendo');
})