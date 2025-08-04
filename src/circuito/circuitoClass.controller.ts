import { Request, Response} from 'express';
import { orm } from '../shared/db/orm.js';
import { CircuitoClass } from './circuitoClass.entity.js';

const em = orm.em;

//get todos los Circuitos
async function findAll(req: Request, res: Response) {
  try{
    const circuitosClass = await em.find('Circuito', {});
    res.status(200).json({message: 'find all circuito classes', data: CircuitoClass});
  } catch (error:any) {
    res.status(500).json({message:error.message})
  }
}

//get para un Circuito en específico
async function findOne(req: Request, res: Response) {
 res.status(500).json({message:'Not implemented'})
}

//post un nuevo Circuito
async function add(req: Request, res: Response) {
  
  try{
    const circuitoClass = em.create(CircuitoClass, req.body)
    await em.flush();
    res.status(201).json({message: 'Circuito class created', data: circuitoClass});
  } catch (error:any) {
    res.status(500).json({message:error.message})
  }
} 


//put&patch de Circuito

async function update(req: Request, res: Response) {
  res.status(500).json({message:'Not implemented'})
} 


//Aunque este definida en el repository con un parametro {id: string} de esta forma tenemos la versatilidad de que manden tanto asi como el character entero
async function remove(req: Request, res: Response) {
  res.status(500).json({message:'Not implemented'})
} 


export {findAll, findOne, add, update, remove };
