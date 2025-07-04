import { Repository } from "../../shared/repository.js"
import { Piloto } from "./piloto.entity.mem.js"
import { EscuderiaRepository } from "../escuderia/escuderia.repository.js"


//"Repositorio" en memoria
const pilotos = [
  new Piloto(
      'Franco Colapinto',
      (new EscuderiaRepository().findOne({id:'2f6cb93c-1d73-4b1e-90b1-2d50e439084f'})),
      43,
      'Argentino',
      'Segundo piloto',
      '2f6cb93c-1d73-4b1e-90b1-2d50e439084f'
  )
]


//Acciones sobre el ""repositorio"" definido en base a la interfaz shared/repository
// veáse que tanto findOne como remove en vez de tener parametro un object "Piloto", tienen un objeto {id:item}
// esto es para que se tenga la versatilidad de mandar tanto un objeto a encontrar o solo el id envuelto en un object  
export class pilotoRepository implements Repository<Piloto>{
  

  public findAll(): Piloto[] | undefined {
      return pilotos
  }

  public findOne(item: { id: string; }): Piloto | undefined {
      return pilotos.find(p=> p.id === item.id)
  }

  public add(item: Piloto): Piloto | undefined {
      pilotos.push(item)
      return item
  }

  //en caso de retornar pilotos[-1] retorna undefined, así funciona js
  public update(item: Piloto): Piloto | undefined {
      const pId = pilotos.findIndex(p => p.id === item.id)

      if(pId !== -1){
        pilotos[pId] = {...pilotos[pId],... item}
        return pilotos[pId]
      }

      
  }

  //en caso de no entrar al if, retorna undefined, así funciona js
  public remove(item: { id: string; }): Piloto | undefined {
    const pId = pilotos.findIndex(p => p.id === item.id)

    if(pId !== -1){

      //splice devuelve un array de los elementos eliminados del array original
      const piloto = pilotos.splice(pId,1)
      return piloto[0]
    }
  }      
}
