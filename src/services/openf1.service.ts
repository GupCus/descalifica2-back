// Funcion que LIMPIA la bd y la popula con todo lo de openf1
// Esta función es DESTRUCTIVA y LENTA ~1600s. Solo usar para inicializar la BD.
// Hay otra función que solo actualiza (TODO)

import { Carrera } from '../carrera/carrera.entity.js';
import { Categoria } from '../categoria/categoria.entity.js';
import { Circuito } from '../circuito/circuito.entity.js';
import { Sesion } from '../sesion/sesion.entity.js';
import { orm } from '../shared/db/orm.js';
import { Temporada } from '../temporada/temporada.entity.js';
import { Meetings } from './openf1.types/meetings.type.js';
import { SessionResult } from './openf1.types/session_result.type.js';
import { Sessions } from './openf1.types/sessions.type.js';
import { Drivers } from './openf1.types/drivers.type.js';
import { Escuderia } from '../escuderia/escuderia.entity.js';
import { Piloto } from '../piloto/piloto.entity.js';
import { EntityManager } from '@mikro-orm/mysql';

const f1api = 'https://api.openf1.org/v1';
// Diccionarios para no tener que ir almacenando todas las instancias en la bd
// cache.set hace que se guarden, .get los busca
const escuderiasCache = new Map<string, Escuderia>();
const pilotosCache = new Map<string, Piloto>();
const circuitosCache = new Map<string, Circuito>();
const temporadas = [2023, 2024, 2025, 2026];

//Adaptador para traducir a la convencion que usamos nosotros
const adaptarTipoSesion = (sessionName: string): string => {
  switch (sessionName.trim()) {
    case 'Practice 1':
      return 'FP1';
    case 'Practice 2':
      return 'FP2';
    case 'Practice 3':
      return 'FP3';
    case 'Qualifying':
      return 'Q';
    case 'Sprint Qualifying':
      return 'SQ';
    case 'Sprint':
      return 'Sprint';
    case 'Race':
      return 'GP';
    default:
      return sessionName;
  }
};

//Workaround para que no me rebote la api por exceso de intentos
//3 req x seg y max 30 por min
// 2000ms aseguran un máximo de 30 requests por minuto
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchF1 = async (url: string) => {
  url = f1api + url;
  await delay(2000);
  let res = await fetch(url);

  // Reintentar si nos siguen odiando
  while (res.status === 429 || res.status === 403) {
    console.log('[ALERTA] Límite de 30min alcanzado. Pausa de 10 segundos...');
    await delay(10000);
    res = await fetch(url);
  }
  return await res.json();
};

const RegenerarBDyDevolverCategoria = async (em: EntityManager) => {
  //Inicio - Destrucción BD
  console.log('Comienzo de la importación. Borrando base de datos...');
  await orm.getSchemaGenerator().refreshDatabase();
  console.log('Base de datos regenerada, iniciando...');

  // Inicio - Creación por fuera de la api
  const F1 = em.create(Categoria, { name: 'F1' });
  temporadas.forEach((ano) => {
    const nuevaTemporada = em.create(Temporada, {
      year: ano,
      racing_series: F1,
    });
    F1.seasons.add(nuevaTemporada);
  });
  console.log('Categoría F1 y temporadas 2023-2026 creadas.');
  return F1;
};
const CargarPilotosyEscuderias = async (em: EntityManager, F1: Categoria) => {
  //Hace un fetch a los pilotos, busca si existe su escudería, si no existe la crea y luego crea al piloto
  const drivers = (await fetchF1('/drivers')) as Drivers[];
  for (const d of drivers) {
    //Hay algunos conductores que no tienen escudería, por como esta armada nuestra bd, se rompería
    //Si se encuentra un caso así lo manda a esta categoría
    const teamName = d.team_name || 'Sin Escudería';
    let escuderia = escuderiasCache.get(teamName);
    if (!escuderia) {
      escuderia = em.create(Escuderia, {
        name: teamName,
        racing_series: F1,
        color: d.team_colour || '000000',
      });
      escuderiasCache.set(teamName, escuderia);
    }

    let piloto = pilotosCache.get(d.full_name);
    if (!piloto) {
      piloto = em.create(Piloto, {
        name: d.full_name,
        num: d.driver_number,
        nationality: d.country_code,
        team: escuderia,
        profile_image: d.headshot_url,
        racing_series: F1,
      });
      pilotosCache.set(d.full_name, piloto);
      em.persist(piloto);
    }
  }
};

const CarrerasySesionesxtemporada = async (
  em: EntityManager,
  temporada: Temporada,
) => {
  let meetings = (await fetchF1(
    '/meetings?year=' + temporada.year,
  )) as Meetings[];

  // Itera sobre cada carrera de cada año
  for (const m of meetings) {
    console.log(`     - Carrera: ${m.circuit_short_name}`);
    //Revisa que exista el circuito, sino lo importa desde la api (si, valida por nombre). Finalmente, crea la carrera
    let circuito = circuitosCache.get(m.circuit_short_name);
    if (!circuito) {
      console.log('       * Creando nuevo circuito:' + m.circuit_short_name);
      circuito = em.create(Circuito, {
        name: m.circuit_short_name,
        country: m.country_code,
        track_map_url: m.circuit_image,
      });
      circuitosCache.set(m.circuit_short_name, circuito);
    }

    let carrera = em.create(Carrera, {
      name: m.meeting_name,
      start_date: m.date_start,
      end_date: m.date_end,
      season: temporada,
      track: circuito,
    });

    console.log('       * Obteniendo sesiones...');

    //Itera sobre las sesiones correspondientes a la carrera, las agrega a su arreglo
    let sesiones = (await fetchF1(
      '/sessions?meeting_key=' + m.meeting_key,
    )) as Sessions[];

    // Había algunos errores con los fetch a sesiones vacias, esto lo ataja
    if (!Array.isArray(sesiones)) sesiones = [];

    for (const s of sesiones) {
      //Los resultados están en otro endpoint, ya los solicito desde acá
      //TODO: HAY QUE CAMBIAR EL FORMATO DE LOS RESULTADOS, ¿CREAR ENTIDAD RESULTADOS?
      let resultadoscrudos = (await fetchF1(
        '/session_result?session_key=' + s.session_key,
      )) as SessionResult[];
      if (!Array.isArray(resultadoscrudos)) resultadoscrudos = [];
      let resultadostramitados = resultadoscrudos.map((r): [string, string] => [
        r.driver_number?.toString() ?? 'undefined',
        r.duration?.toString() ?? 'undefined',
      ]);

      let sesion = em.create(Sesion, {
        name: s.session_name,
        type: adaptarTipoSesion(s.session_name),
        start_time: s.date_start,
        end_time: s.date_end,
        race: carrera,
        results: resultadostramitados,
      });
      carrera.sessions.add(sesion);
    }
    //Agrega la carrera con sus sesiones a la temporada
    temporada.races.add(carrera);

    //Asignar piloto y escudería campeonas
    //TO DO
  }
};
// Funcion principal
// Me abuse un poco de los log, habia que ver que pasaba
export const destruirbd_importaropenf1 = async () => {
  const em = orm.em.fork();

  //Inicio
  const F1 = await RegenerarBDyDevolverCategoria(em);

  // En proceso, fetchs a openf1
  console.log('Iniciando peticiones a OpenF1 API...');

  //1 - Creacion pilotos y escuderías
  console.log('PARTE 1/2: Procesando pilotos y escuderías...');
  await CargarPilotosyEscuderias(em, F1);
  //2 - Itera sobre cada temporada 2023-2026
  console.log('PARTE 2/2: Procesando temporadas, carreras y sesiones...');

  let indice = 1;
  for (const temporada of F1.seasons) {
    console.log('Año ' + temporada.year + `( ${indice}/${F1.seasons.length})`);
    await CarrerasySesionesxtemporada(em, temporada);
    indice++;
    // evitar que se quede sin memoria, hacemos un flush por temporada
    console.log('Guardando progreso del año' + temporada.year);
    await em.flush();
  }

  //Finalmente, flush final
  await em.flush();
  console.log('completada con éxito!');
};

//Temporal, para correrlo
export const openf1service = () => {
  console.log('Iniciando ejecución manual de la importación...');

  destruirbd_importaropenf1()
    .then(() => {
      console.log('El proceso ha finalizado correctamente.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Hubo un error crítico durante la ejecución:', error);
      process.exit(1);
    });
};
