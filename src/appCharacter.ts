//Recordar el pnpm install para los módulos
//No hace falta hacer nada, ya lo acomodé pero como estamos utilizando Express@4 al instalar los tipos tenemos que instalar pnpm add -D @types/express@4

//Tener correctamente configurado fnm en la terminal donde abrimos vscode (seguramente el bash de git además de powershell, sino no van a funcionar los comandos de node y npm)
//Primero buildear y despues start:dev
//los import, como el de character agregarle .js al final o va a lanzar error de que no lo encuentra(me pelee con copilot por esto como por 2h)

import express, { NextFunction, Request, Response } from 'express'
import { Character } from './character/character.js'


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

function sanitizeCharacterInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    characterClass: req.body.characterClass,
    level: req.body.level,
    hp: req.body.hp,
    mana: req.body.mana,
    attack: req.body.attack,
    items: req.body.items,
  }
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

const app = express();

app.use(express.json())

app.get('/api/characters', (req, res) => {
    res.json({ data: characters })
})

app.get('/api/characters/:id', (req, res) => {
  const character = characters.find(c => c.id === req.params.id)
  if(!character){
    return res.status(404).json({ message: 'Character not found' })
  }
  res.json({ data: character })
})

app.post('/api/characters',sanitizeCharacterInput, (req, res) => {
  const input = req.body.sanitizedInput
  const newCharacter = new Character(
    input.name,
    input.characterClass,
    input.level,
    input.hp,
    input.mana,
    input.attack,
    input.items
  )
  characters.push(newCharacter)
  res.status(201).send({ message: 'Character created', data: newCharacter })
})
app.put('/api/characters/:id', sanitizeCharacterInput, (req, res) => {
  const characterIdx = characters.findIndex(c => c.id === req.params.id)
  if (characterIdx == -1) {
    return res.status(404).send({ message: 'Character not found' })
  }else{
    characters[characterIdx] = {...characters[characterIdx],...req.body.sanitizedInput}
    return res.status(200).send({message: 'Character Updated', data: characters[characterIdx]})
  }})

app.patch('/api/characters/:id', sanitizeCharacterInput, (req, res) => {
  const characterIdx = characters.findIndex(c => c.id === req.params.id)
  if (characterIdx == -1) {
    return res.status(404).send({ message: 'Character not found' })
  }else{
    Object.assign(characters[characterIdx],req.body.sanitizedInput)
    return res.status(200).send({message: 'Character Patched', data: characters[characterIdx]})
  }})

app.delete('/api/characters/:id', sanitizeCharacterInput, (req, res) => {
  const characterIdx = characters.findIndex(c => c.id === req.params.id)
  if (characterIdx == -1) {
    return res.status(404).send({ message: 'Character not found' })
  }else{
    characters.splice(characterIdx,1)
    return res.status(200).send({message: 'Character Deleted Succesfully'})
  }})

app.use((_,res) => {
  return res.status(404).send({ message: 'Not Found' })
})

app.listen(3000,()=>{
    console.log('Corriendo en localhost:3000');
})