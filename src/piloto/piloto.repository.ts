import { Repository } from "../shared/repository.js";
import { Piloto } from "./piloto.entity.js";

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

export class PilotoRepository implements Repository<Piloto>{

    public findAll(): Piloto[] | undefined {
        return pilotos
    }

    public findOne(item: { id: string; }): Piloto | undefined {
        return pilotos.find((p) => p.id === item.id)
    }

    public add(item: Piloto): Piloto | undefined {
        pilotos.push(item)
        return item
    }

    public update(item: Piloto): Piloto | undefined {
        const PilotoIdx = pilotos.findIndex((p) => p.id === item.id)
        
        if(PilotoIdx !== -1){
            pilotos[PilotoIdx] = {...pilotos[PilotoIdx], ...item}
        }
        return pilotos[PilotoIdx]
    }

    public delete(item: { id: string; }): Piloto | undefined {
        const PilotoIdx = pilotos.findIndex((p) => p.id === item.id)

    if(PilotoIdx !== -1){
        const deletedPilotos = pilotos[PilotoIdx]
        pilotos.splice(PilotoIdx, 1)
        return deletedPilotos
    }
    }
}