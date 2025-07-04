import { Repository } from "../../shared/repository.js"
import { Escuderia } from "./escuderia.entity.mem.js"

//"Repositorio" en memoria
const escuderias = [
  new Escuderia(
      'Alpine',
      2021,
      'Francia',
      'Renault E-Tech',
      '2f6cb93c-1d73-4b1e-90b1-2d50e439084f'
  )
]


//Acciones sobre el ""repositorio"" definido en base a la interfaz shared/repository
// veáse que tanto findOne como remove en vez de tener parametro un object "Escuderia", tienen un objeto {id:item}
// esto es para que se tenga la versatilidad de mandar tanto un objeto a encontrar o solo el id envuelto en un object  
export class EscuderiaRepository implements Repository<Escuderia>{
  

  public findAll(): Escuderia[] | undefined {
      return escuderias
  }

  public findOne(item: { id: string; }): Escuderia | undefined {
      return escuderias.find(p=> p.id === item.id)
  }

  public add(item: Escuderia): Escuderia | undefined {
      escuderias.push(item)
      return item
  }

  //en caso de retornar Escuderias[-1] retorna undefined, así funciona js
  public update(item: Escuderia): Escuderia | undefined {
      const pId = escuderias.findIndex(p => p.id === item.id)

      if(pId !== -1){
        escuderias[pId] = {...escuderias[pId],... item}
        return escuderias[pId]
      }

      
  }

  //en caso de no entrar al if, retorna undefined, así funciona js
  public remove(item: { id: string; }): Escuderia | undefined {
    const pId = escuderias.findIndex(p => p.id === item.id)

    if(pId !== -1){

      //splice devuelve un array de los elementos eliminados del array original
      const escuderia = escuderias.splice(pId,1)
      return escuderia[0]
    }
  }      
}
