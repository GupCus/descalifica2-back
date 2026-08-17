// Funcion que LIMPIA la bd y la popula con todo lo de openf1
// Esta función es DESTRUCTIVA y LENTA. Solo usar para inicializar la BD.
// Hay otra función que solo actualiza (TODO)

import { Carrera } from "../src/carrera/carrera.entity.js";
import { Categoria } from "../src/categoria/categoria.entity.js";
import { Circuito } from "../src/circuito/circuito.entity.js";
import { Sesion } from "../src/sesion/sesion.entity.js";
import { orm } from "../src/shared/db/orm.js"
import { Temporada } from "../src/temporada/temporada.entity.js";
import { Meetings } from "./types/meetings.type.js";
import { SessionResult } from "./types/session_result.type.js";
import { Sessions } from "./types/sessions.type.js";
import { Drivers } from "./types/drivers.type.js";
import { Escuderia } from "../src/escuderia/escuderia.entity.js";
import { Piloto } from "../src/piloto/piloto.entity.js";

// Diccionarios en memoria para no consultar la base de datos en cada iteración y evitar duplicados
const escuderiasCache = new Map<string, Escuderia>();
const circuitosCache = new Map<string, Circuito>();
const tipos = ["FP1","FP2","FP3","Q","SQ","Sprint","GP"];
const temporadas = [2026]

const parsearTipoSesion = (sessionName: string): string => {
  switch (sessionName.trim()) {
    case "Practice 1": return "FP1";
    case "Practice 2": return "FP2";
    case "Practice 3": return "FP3";
    case "Qualifying": return "Q";
    case "Sprint Qualifying": return "SQ";
    case "Sprint": return "Sprint";
    case "Race": return "GP";
    default: return sessionName; // Por si viene algún nombre distinto
  }
};

export const destruirbd_importaropenf1 = async()=>{
  const em = orm.em.fork();
  const inicioProceso = performance.now();
  const log = (msg: string) => {
    const segundos = ((performance.now() - inicioProceso) / 1000).toFixed(1);
    console.log(`[log] [${segundos}s] ` + msg);
  };

  //Inicio - Destrucción BD
  log("Comienzo de la importación. Borrando base de datos...");
  await orm.getSchemaGenerator().refreshDatabase();
  log("Base de datos regenerada, iniciando...");

  // Inicio - Creación por fuera de la api
  const F1 = em.create(Categoria, { name: "F1" })
  temporadas.forEach(ano => {
    const nuevaTemporada = em.create(Temporada, { 
      year: ano, 
      racing_series: F1
    });
    F1.seasons.add(nuevaTemporada);
  });
  log("Categoría F1 y temporadas 2023-2026 creadas.");

  // En proceso, fetchs a openf1
  log("Iniciando peticiones a OpenF1 API...");
  
  //1 - Creacion pilotos y escuderías
  log("PARTE 1/2: Procesando pilotos y escuderías...");
  const drivers = await (await fetch("https://api.openf1.org/v1/drivers")).json() as Drivers[]
  for(const d of drivers){
    let escuderia = escuderiasCache.get(d.team_name)
    if(!escuderia){
      escuderia = em.create(Escuderia,{
        name:d.team_name,
        racing_series:F1,
        color:d.team_colour,
      })
      escuderiasCache.set(d.team_name, escuderia);
    }
    let piloto = em.create(Piloto, {
      name: d.broadcast_name,
      num: d.driver_number,
      nationality: d.country_code,
      team: escuderia,
    })
    em.persist(piloto);
  }

  //2 - Itera sobre cada temporada 2023-2026
  log("PARTE 2/2: Procesando temporadas, carreras y sesiones...");
  let indice = 1;
  for (const temporada of F1.seasons) {
    log(`  -> Año ${temporada.year} (${indice}/${F1.seasons.length})`);
    let meetings = await(await fetch("https://api.openf1.org/v1/meetings?year=" + temporada.year)).json() as Meetings[]
    
    // Itera sobre cada carrera de cada año
    for(const m of meetings){
      log(`     - Carrera: ${m.circuit_short_name}`);

      //Revisa que exista el circuito, sino lo importa desde la api (si, valida por nombre). Finalmente, crea la carrera
      let circuito = circuitosCache.get(m.circuit_short_name)
      if(!circuito){
        log("       * Creando nuevo circuito:" + m.circuit_short_name);
        // Agregamos comprobación para evitar fallos si m.circuit_info_url no existe
        let year = m.circuit_info_url ? (await (await fetch(m.circuit_info_url)).json()).year : null; 
        circuito = em.create(Circuito,{
          name:m.circuit_short_name,
          country:m.country_code,
          length: "0",
        track_map_url: m.circuit_image,
          year: year,
        })
        circuitosCache.set(m.circuit_short_name, circuito);
      }
      let carrera = em.create(Carrera,{
        name:m.meeting_name,
        start_date:m.date_start,
        end_date:m.date_end,
        season: temporada,
        track: circuito,
      })

      log("       * Obteniendo sesiones...");

      //Itera sobre las sesiones correspondientes a la carrera, las agrega a su arreglo
      let sesiones = await(await fetch("https://api.openf1.org/v1/sessions?meeting_key=" + m.meeting_key)).json() as Sessions[]
      for(const s of sesiones){
        //Los resultados están en otro endpoint, ya los solicito desde acá
        //TODO: HAY QUE CAMBIAR EL FORMATO DE LOS RESULTADOS, ¿CREAR ENTIDAD RESULTADOS?
        let resultadoscrudos = await(await fetch("https://api.openf1.org/v1/session_result?session_key=" + s.session_key)).json() as SessionResult[]
        let resultadostramitados = resultadoscrudos.map((r):[string,string] => [
          r.driver_number?.toString() ?? "unknown",
          r.duration?.toString() ?? "undefined", 
        ]);
        let sesion = em.create(Sesion,{
          name:s.session_name,
          type: parsearTipoSesion(s.session_name),
          start_time:s.date_start,
          end_time:s.date_end,
          race:carrera,
          results: resultadostramitados,
        })
        carrera.sessions.add(sesion);
      }
      //Agrega la carrera con sus sesiones a la temporada
      temporada.races.add(carrera)
      
      //Asignar piloto y escudería campeonas
      //PENDIENTE TODO
    }
    indice++;
    // evitar que se quede sin memoria, hacemos un flush por temporada
    log("  -> Guardando progreso del año" + temporada.year);
    await em.flush();
  }

  //Finalmente, flush final por las dudas
  log("Finalizando...");
  await em.flush()
  log("completada con éxito!");
}
