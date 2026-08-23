import { Carrera } from '../../carrera/carrera.entity.js';
import { Categoria } from '../../categoria/categoria.entity.js';
import { Circuito } from '../../circuito/circuito.entity.js';
import { Sesion } from '../../sesion/sesion.entity.js';
import { orm } from '../../shared/db/orm.js';
import { Temporada } from '../../temporada/temporada.entity.js';
import { Meetings } from './openf1.types/meetings.type.js';
import { SessionResult } from './openf1.types/session_result.type.js';
import { Sessions } from './openf1.types/sessions.type.js';
import { Drivers } from './openf1.types/drivers.type.js';
import { Escuderia } from '../../escuderia/escuderia.entity.js';
import { Piloto } from '../../piloto/piloto.entity.js';
import { EntityManager } from '@mikro-orm/mysql';
import { Championship_Drivers } from './openf1.types/championship_drivers.type.js';
import { Championship_Teams } from './openf1.types/championship_teams.type.js';
import { Session_Result } from '../../sesion/session_result.entity.js';
import { error } from 'node:console';

const f1api = 'https://api.openf1.org/v1';
const temporadas = [2023, 2024, 2025, 2026];

// FUNCIONES PARA AYUDAR A LAS OTRAS

//Workaround para que no me rebote la api por exceso de intentos
//3 req x seg y max 30 por min
//2s x req aseguran un máximo de 30 requests por minuto
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

//Los headshot vienen con un .transform que me baja la calidad, acá se lo quito
const crearUrlHeadshot = (
  url: string | null | undefined,
): string | undefined => {
  if (!url) return undefined;
  const transform = url.indexOf('.transform');
  if (transform !== -1) {
    return url.substring(0, transform);
  }
  return url;
};

// FUNCIONES PRINCIPALES

//Funcion para encontrar el mejor piloto y escudería de la temporada desde openf1
const asignarganadores = async (
  em: EntityManager,
  temporada: Temporada,
  ultimameeting = 'latest',
) => {
  //Esto da un objeto con propiedad .driver_number, el cual es un campo de piloto(num), necesito buscar esa entidad piloto y asignarla a temporada.winner_driver
  const resultadospilotos = (await fetchF1(
    '/championship_drivers?meeting_key=' +
      ultimameeting +
      '&position_current=1',
  )) as Championship_Drivers[];

  if (resultadospilotos && resultadospilotos.length > 0) {
    // Buscar en la bd de pilotos por su número
    const pilotoGanador = await em.findOne(Piloto, {
      num: resultadospilotos[0].driver_number,
      season: temporada,
    });
    if (pilotoGanador) {
      temporada.winner_driver = pilotoGanador;
      console.log(
        'El piloto ganador de la temporada ' +
          temporada.year +
          ' es ' +
          pilotoGanador.name,
      );
    }
  }
  //Esto da un objeto con propiedad .team_name, el cual es un campo de escuderia(name), necesito buscar esa entidad escuderia y asignarla a temporada.winner_driver
  const resultadosescuderias = (await fetchF1(
    '/championship_teams?meeting_key=' + ultimameeting + '&position_current=1',
  )) as Championship_Teams[];

  if (resultadosescuderias && resultadosescuderias.length > 0) {
    // Buscar en la bd de escuderías por su nombre
    const escuderiaGanadora = await em.findOne(Escuderia, {
      name: resultadosescuderias[0].team_name,
    });
    if (escuderiaGanadora) {
      temporada.winner_team = escuderiaGanadora;
      escuderiaGanadora.wccs.add(temporada);
      console.log(
        'La escudería ganadora de la temporada ' +
          temporada.year +
          ' es ' +
          escuderiaGanadora.name,
      );
    }
  }
};

//Funcion para cargar a la bd todos los pilotos que provee openf1
//ADVERTENCIA: Los pilotos dependen de la meeting y session, esta funcion necesita una temporada para asignarlos a esa temporada
//Por ejemplo, max vestappen lo podes encontrar con num 1 si buscamos una meeting de 2025, aunque ahora es el 3
//Incorpora conductores por session
const CargarPilotosyEscuderias = async (
  em: EntityManager,
  temporada: Temporada,
  session_key = 'latest',
) => {
  //Hace un fetch a los pilotos, busca si existe su escudería, si no existe la crea y luego crea al piloto
  const drivers = (await fetchF1(
    '/drivers?session_key=' + session_key,
  )) as Drivers[];
  for (const d of drivers) {
    //Hay algunos conductores que no tienen escudería, por defecto, los descartamos.
    const teamName = d.team_name;
    if (teamName) {
      let escuderia = await em.findOne(Escuderia, { name: d.team_name });
      if (!escuderia) {
        escuderia = em.create(Escuderia, {
          name: teamName,
          racing_series: temporada.racing_series,
          color: d.team_colour,
        });
      }
      em.persist(escuderia);

      let piloto = await em.findOne(Piloto, {
        name: d.full_name,
        season: temporada,
      });

      if (!piloto) {
        piloto = em.create(Piloto, {
          name: d.full_name,
          num: d.driver_number,
          nationality: d.country_code,
          team: escuderia,
          profile_image: crearUrlHeadshot(d.headshot_url),
          season: temporada,
          racing_series: temporada.racing_series,
        });
        em.persist(piloto);
      } else {
        //Si hubo algun cambio en la escuderia o las imagenes del piloto, las actualiza
        if (piloto.team.name !== d.team_name) piloto.team = escuderia;
        if (piloto.profile_image !== crearUrlHeadshot(d.headshot_url))
          piloto.profile_image = crearUrlHeadshot(d.headshot_url);
      }
    }
  }
  await em.flush();
};

//Conseguir carreras y sesiones
const CarrerasySesionesxtemporada = async (
  em: EntityManager,
  temporada: Temporada,
) => {
  //Llamada a la API
  const meetings = (await fetchF1(
    '/meetings?year=' + temporada.year,
  )) as Meetings[];

  // Itera sobre cada carrera de la temporada
  for (const m of meetings) {
    console.log(`     - Carrera: ${m.circuit_short_name}`);

    //Revisa que exista el circuito, sino lo importa desde la api (si, valida por nombre). Finalmente, crea la carrera
    let circuito = await em.findOne(Circuito, { name: m.circuit_short_name });
    if (!circuito) {
      console.log('       * Creando nuevo circuito:' + m.circuit_short_name);
      circuito = em.create(Circuito, {
        name: m.circuit_short_name,
        country: m.country_code,
        track_map_url: m.circuit_image,
      });
      em.persist(circuito);
    }

    const carrera = em.create(Carrera, {
      name: m.meeting_name,
      start_date: m.date_start,
      end_date: m.date_end,
      season: temporada,
      track: circuito,
    });

    //Itera sobre las sesiones correspondientes a la carrera, las agrega a su arreglo
    await actualizarsesiones(em, carrera, m.meeting_key.toString());
    //Agrega la carrera con sus sesiones a la temporada
    temporada.races.add(carrera);
  }
};

async function actualizarsesiones(
  em: EntityManager,
  carrera: Carrera,
  meeting_key: string,
) {
  // Precargamos los pilotos para no hacer 29 millones de findone
  let pilotos = await em.find(Piloto, { season: carrera.season });
  // Inicializamos la colección por si no vino poblada
  if (!carrera.sessions.isInitialized()) {
    await carrera.sessions.init();
  }
  //Llamda a la API
  console.log('       * Obteniendo sesiones...');
  let sesiones = (await fetchF1(
    '/sessions?meeting_key=' + meeting_key,
  )) as Sessions[];

  // Había algunos errores con los fetch a sesiones vacias, esto lo ataja
  if (!Array.isArray(sesiones)) sesiones = [];
  for (const s of sesiones) {
    //Los resultados están en otro endpoint, ya los solicito desde acá
    //Copié el formato de resultados de la api
    let resultadoscrudos = (await fetchF1(
      '/session_result?session_key=' + s.session_key,
    )) as SessionResult[];
    if (!Array.isArray(resultadoscrudos)) resultadoscrudos = [];

    let sesion = carrera.sessions
      .getItems()
      .find((ses) => ses.name === s.session_name);

    if (!sesion) {
      // Crea una sesion, mapea los resultados con los pilotos
      sesion = em.create(Sesion, {
        name: s.session_name,
        type: adaptarTipoSesion(s.session_name),
        start_time: s.date_start,
        end_time: s.date_end,
        race: carrera,
      });
      carrera.sessions.add(sesion);
    } else {
      if (sesion.session_result && !sesion.session_result.isInitialized()) {
        await sesion.session_result.init();
      }
      // Limpiamos los resultados viejos si la sesión ya existía
      if (sesion.session_result) {
        sesion.session_result.removeAll();
      }
    }

    const resultadostramitados = [];
    for (const r of resultadoscrudos) {
      let piloto = pilotos.find((p) => p.num === r.driver_number);

      // Si el piloto no está en la bd, llamamos a la carga de pilotos para esa sesion
      // Si la api no le asigno una escuderia, seguramente lance undefined/null aunque primero lo busca
      if (!piloto && r.driver_number) {
        console.log(
          `[!] Piloto ${r.driver_number} no encontrado. Cargando pilotos de la sesión ${s.session_key}...`,
        );
        await CargarPilotosyEscuderias(
          em,
          carrera.season,
          s.session_key.toString(),
        );

        // Actualizamos pilotos
        pilotos = await em.find(Piloto, {
          season: carrera.season,
        });

        // Lo volvemos a buscar
        piloto = pilotos.find((p) => p.num === r.driver_number);
      }

      // En qualys me entrega un arreglo de resultados, solucion temporal, los convierto en strings
      const transformarenstring = (a: any) =>
        Array.isArray(a) ? a.toString() : a;

      const resultado = em.create(Session_Result, {
        position: r.position,
        number_of_laps: r.number_of_laps,
        dnf: r.dnf,
        dns: r.dns,
        dsq: r.dsq,
        duration: transformarenstring(r.duration),
        gap_to_leader: transformarenstring(r.gap_to_leader),
        piloto: piloto,
        session: sesion,
      });
      resultadostramitados.push(resultado);
    }

    sesion.session_result.add(resultadostramitados);
  }
}

//Funcion para actualizar los resultados de alguna carrera,
//Si no se escribe un id, actualizará la ultima

async function actualizarresultados(id?: number) {
  const em = orm.em.fork();

  //Caso sin id
  if (!id) {
    console.log('actualizando la ultima carrera');
    const hoy = new Date();
    const temporada = await em.findOne(Temporada, {
      year: hoy.getFullYear(),
    });
    if (temporada) {
      const carrera = await em.findOne(
        Carrera,
        { season: temporada, start_date: { $lt: hoy } },
        {
          orderBy: { start_date: 'DESC' },
          populate: ['sessions', 'sessions.session_result'],
        },
      );
      if (carrera) {
        //a veces cambian los pilotos de escuderia en una sesion
        await CargarPilotosyEscuderias(em, carrera.season);
        await actualizarsesiones(em, carrera, 'latest');
        console.log('Se actualizó la carrera: ' + carrera.name);
      }
      //Actualizar ganadores
      await asignarganadores(em, temporada);
    }

    //Caso con id
  } else {
    console.log('actualizando la carrera id: ' + id);
    const carrera = await em.findOne(
      Carrera,
      { id },
      {
        populate: ['season', 'sessions', 'sessions.session_result'],
      },
    );
    if (carrera) {
      const temporada = carrera.season;
      if (temporada) {
        await CargarPilotosyEscuderias(em, carrera.season);
        const meetings = (await fetchF1(
          '/meetings?meeting_name=' +
            //Esto me transforma la string en formato uri
            encodeURIComponent(carrera.name) +
            '&year=' +
            temporada.year,
        )) as Meetings[];

        if (meetings && meetings.length > 0) {
          const meeting_key = meetings[0].meeting_key.toString();
          await actualizarsesiones(em, carrera, meeting_key);
          console.log('Se actualizó la carrera: ' + carrera.name);
        } else {
          console.log('No se encontró la carrera en OpenF1: ' + carrera.name);
        }
      }
      //Caso alt: nos mandaron un id que no corresponde a ninguna
    } else {
      throw error('No se encontró la carrera');
    }
  }
  await em.flush();
  console.log('hecho!');
}

// FUNCIONES PARA CONSTRUIR DE CERO UNA BD
// Me abuse un poco de los log, habia que ver que pasaba
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
  em.persist(F1);
  console.log('Categoría F1 y temporadas 2023-2026 creadas.');
  return F1;
};

const destruirbd_importaropenf1 = async () => {
  const em = orm.em.fork();

  //Inicio
  const F1 = await RegenerarBDyDevolverCategoria(em);

  // En proceso, fetchs a openf1
  console.log('Iniciando peticiones a OpenF1 API...');

  //Itera sobre cada temporada 2023-2026

  for (const temporada of F1.seasons) {
    console.log('Año ' + temporada.year);

    //Para encontrar el ganador necesito los puntos en la ultima carrera que ocurrió
    //El problema era es que en 2026 la ultima carrera es una que no ocurrió aún
    //Para esto hago un fetch a meetings=latest
    const hoy = new Date();

    //Tengo que conseguir la ultima session
    const meetings = (await fetchF1(
      '/meetings?year=' + temporada.year,
    )) as Meetings[];
    let ultimasesiones;
    let ultimacarrera;
    if (hoy.getFullYear() === temporada.year) {
      ultimacarrera = (
        (await fetchF1('/meetings?meeting_key=latest')) as Meetings[]
      )[0].meeting_key;
      ultimasesiones = (await fetchF1(
        '/sessions?meeting_key=latest',
      )) as Sessions[];
    } else {
      ultimacarrera = meetings[meetings.length - 1].meeting_key;
      ultimasesiones = (await fetchF1(
        '/sessions?meeting_key=' + ultimacarrera,
      )) as Sessions[];
    }
    const ultimasesion = ultimasesiones[ultimasesiones.length - 1].session_key;

    //1 - Creacion pilotos y escuderías
    console.log('PARTE 1/2: Procesando pilotos y escuderías...');
    await CargarPilotosyEscuderias(em, temporada, ultimasesion.toString());
    await em.flush();

    //2 - Creacion de carreras por temporada
    console.log('PARTE 2/2: Procesando carreras y sesiones...');
    await CarrerasySesionesxtemporada(em, temporada);
    //Asignar piloto y escudería campeonas
    await asignarganadores(em, temporada, ultimacarrera.toString());

    // evitar que se quede sin memoria, hacemos un flush por temporada
    console.log('Guardando progreso del año' + temporada.year);
    await em.flush();
  }

  //Finalmente, flush final
  await em.flush();
  console.log('completada con éxito!');
};

export { destruirbd_importaropenf1, actualizarresultados };
