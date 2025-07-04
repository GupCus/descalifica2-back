import { Categoria } from "./categoria.entity.mem.js";
import { EscuderiaRepository } from "../escuderia/escuderia.repository.js";
import { pilotoRepository } from "../piloto/piloto.repository.js";
import { Repository } from "../../shared/repository.js";



const categorias = [
    new Categoria(
        'Fórmula 1',
        (new EscuderiaRepository().findAll()),
        (new pilotoRepository().findAll()),

    )
]

export class CategoriaRepository implements Repository<Categoria>{


    public findAll(): Categoria[] | undefined {
        return categorias
    }

    public findOne(item: { id:string; }): Categoria | undefined {
        return categorias.find(c => c.id === item.id)
    }

    public add(item: Categoria): Categoria | undefined {
        categorias.push(item)
        return item
    }

    public update(item: Categoria): Categoria | undefined {
        const cId = categorias.findIndex(c => c.id === item.id)

        if(cId !==-1){
            categorias[cId] = {...categorias[cId],...item}
            return categorias[cId]
        }
    }

    public remove(item: { id: string; }): Categoria | undefined {
        const cId = categorias.findIndex(c => c.id === item.id)

        if(cId !==-1){
            const categoria = categorias.splice(cId,1)
            return categoria[0]
        }
    }
}