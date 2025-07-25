//import { Repository } from '../shared/repository.js';
import { Circuito } from './circuito.entity.js';

//"Repositorio" en memoria
const circuitos = [new Circuito('Monaco', 'Monaco', 3.35, 1929)];

//Acciones sobre el ""repositorio"" definido en base a la interfaz shared/repository
// veáse que tanto findOne como remove en vez de tener parametro un object "Circuito", tienen un objeto {id:item}
// esto es para que se tenga la versatilidad de mandar tanto un objeto a encontrar o solo el id envuelto en un object

/*export class CircuitoRepository implements Repository<Circuito> {
  public findAll(): Circuito[] | undefined {
    return circuitos;
  }


  public findOne(item: { id: string }): Circuito | undefined {
    return circuitos.find((p) => p.id === item.id);
  }

  public add(item: Circuito): Circuito | undefined {
    circuitos.push(item);
    return item;
  }

  //en caso de retornar circuitos[-1] retorna undefined, así funciona js
  public update(item: Circuito): Circuito | undefined {
    const pId = circuitos.findIndex((p) => p.id === item.id);

    if (pId !== -1) {
      circuitos[pId] = { ...circuitos[pId], ...item };
      return circuitos[pId];
    }
  }

  //en caso de no entrar al if, retorna undefined, así funciona js
  public remove(item: { id: string }): Circuito | undefined {
    const pId = circuitos.findIndex((p) => p.id === item.id);

    if (pId !== -1) {
      //splice devuelve un array de los elementos eliminados del array original
      const circuito = circuitos.splice(pId, 1);
      return circuito[0];
    }
  }
}
*/
