import { orm } from './shared/db/orm.js';
import { Categoria } from './categoria/categoria.entity.js';
import { Marca } from './marca/marca.entity.js';
import { Escuderia } from './escuderia/escuderia.entity.js';
import { Piloto } from './piloto/piloto.entity.js';
import { Temporada } from './temporada/temporada.entity.js';
import { Circuito } from './circuito/circuito.entity.js';
import { Carrera } from './carrera/carrera.entity.js';
import { Sesion } from './sesion/sesion.entity.js';
import { baseEntity } from './shared/baseEntity.entity.js';

async function runSeeder() {
  const em = orm.em.fork();

  console.log("Limpiando la base de datos...");
  // Limpiar en orden inverso para evitar problemas de Foreign Keys
  await em.nativeDelete(Sesion, {});
  await em.nativeDelete(Carrera, {});
  await em.nativeDelete(Circuito, {});
  await em.nativeDelete(Temporada, {});
  await em.nativeDelete(Piloto, {});
  await em.nativeDelete(Escuderia, {});
  await em.nativeDelete(Marca, {});
  await em.nativeDelete(Categoria, {});

  console.log("Creando Categorías...");
  const f1 = em.create(Categoria, { name: 'Fórmula 1', description: 'La categoría reina del automovilismo.' });
  const f2 = em.create(Categoria, { name: 'Fórmula 2', description: 'La antesala a la F1.' });

  console.log("Creando Temporadas...");
  const t2024F1 = em.create(Temporada, { year: 2024, racing_series: f1 });
  const t2024F2 = em.create(Temporada, { year: 2024, racing_series: f2 });

  console.log("Creando Marcas...");
  const marcasData = [
    { name: 'Ferrari', nationality: 'IT', foundation: 1947 },
    { name: 'Mercedes', nationality: 'DE', foundation: 1926 },
    { name: 'Renault', nationality: 'FR', foundation: 1899 },
    { name: 'Honda', nationality: 'JP', foundation: 1948 },
    { name: 'Dallara', nationality: 'IT', foundation: 1972 } // Usada por todos en F2
  ];
  const marcas: Record<string, Marca> = {};
  for (const m of marcasData) {
    const marca = em.create(Marca, m);
    marcas[m.name] = marca;
  }

  console.log("Creando Escuderías de F1 y F2...");
  const escuderiasF1Data = [
    { name: 'Red Bull Racing', fundation: 2005, nationality: 'AT', engine: 'Honda', brand: marcas['Honda'] },
    { name: 'Mercedes-AMG PETRONAS', fundation: 2010, nationality: 'DE', engine: 'Mercedes', brand: marcas['Mercedes'] },
    { name: 'Scuderia Ferrari', fundation: 1929, nationality: 'IT', engine: 'Ferrari', brand: marcas['Ferrari'] },
    { name: 'McLaren', fundation: 1963, nationality: 'GB', engine: 'Mercedes', brand: null },
    { name: 'Aston Martin', fundation: 2021, nationality: 'GB', engine: 'Mercedes', brand: null },
    { name: 'Alpine', fundation: 2021, nationality: 'FR', engine: 'Renault', brand: marcas['Renault'] },
    { name: 'Williams', fundation: 1977, nationality: 'GB', engine: 'Mercedes', brand: null },
    { name: 'RB', fundation: 2006, nationality: 'IT', engine: 'Honda', brand: null },
    { name: 'Kick Sauber', fundation: 1993, nationality: 'CH', engine: 'Ferrari', brand: null },
    { name: 'Haas', fundation: 2016, nationality: 'US', engine: 'Ferrari', brand: null },
  ];
  
  const escuderiasF2Data = [
    { name: 'ART Grand Prix', fundation: 2005, nationality: 'FR', engine: 'Mecachrome', brand: marcas['Dallara'] },
    { name: 'Prema Racing', fundation: 1983, nationality: 'IT', engine: 'Mecachrome', brand: marcas['Dallara'] },
    { name: 'Rodin Motorsport', fundation: 2024, nationality: 'NZ', engine: 'Mecachrome', brand: marcas['Dallara'] },
    { name: 'DAMS Lucas Oil', fundation: 1988, nationality: 'FR', engine: 'Mecachrome', brand: marcas['Dallara'] },
    { name: 'Invicta Racing', fundation: 2012, nationality: 'GB', engine: 'Mecachrome', brand: marcas['Dallara'] },
    { name: 'MP Motorsport', fundation: 1995, nationality: 'NL', engine: 'Mecachrome', brand: marcas['Dallara'] },
    { name: 'Van Amersfoort Racing', fundation: 1975, nationality: 'NL', engine: 'Mecachrome', brand: marcas['Dallara'] },
    { name: 'Hitech Pulse-Eight', fundation: 2015, nationality: 'GB', engine: 'Mecachrome', brand: marcas['Dallara'] },
    { name: 'Campos Racing', fundation: 1997, nationality: 'ES', engine: 'Mecachrome', brand: marcas['Dallara'] },
    { name: 'Trident', fundation: 2006, nationality: 'IT', engine: 'Mecachrome', brand: marcas['Dallara'] },
    { name: 'AIX Racing', fundation: 2024, nationality: 'DE', engine: 'Mecachrome', brand: marcas['Dallara'] },
  ];

  const escuderias: Record<string, Escuderia> = {};
  for (const e of escuderiasF1Data) {
    const esc = em.create(Escuderia, { ...e, racing_series: f1 });
    escuderias[e.name] = esc;
  }
  for (const e of escuderiasF2Data) {
    const esc = em.create(Escuderia, { ...e, racing_series: f2 });
    escuderias[e.name] = esc;
  }

  console.log("Creando Pilotos...");
  const pilotosF1 = [
    { name: 'Max Verstappen', num: 1, nationality: 'NL', teamName: 'Red Bull Racing', birth: '1997-09-30' },
    { name: 'Sergio Perez', num: 11, nationality: 'MX', teamName: 'Red Bull Racing', birth: '1990-01-26' },
    { name: 'Lewis Hamilton', num: 44, nationality: 'GB', teamName: 'Mercedes-AMG PETRONAS', birth: '1985-01-07' },
    { name: 'George Russell', num: 63, nationality: 'GB', teamName: 'Mercedes-AMG PETRONAS', birth: '1998-02-15' },
    { name: 'Charles Leclerc', num: 16, nationality: 'MC', teamName: 'Scuderia Ferrari', birth: '1997-10-16' },
    { name: 'Carlos Sainz', num: 55, nationality: 'ES', teamName: 'Scuderia Ferrari', birth: '1994-09-01' },
    { name: 'Lando Norris', num: 4, nationality: 'GB', teamName: 'McLaren', birth: '1999-11-13' },
    { name: 'Oscar Piastri', num: 81, nationality: 'AU', teamName: 'McLaren', birth: '2001-04-06' },
    { name: 'Fernando Alonso', num: 14, nationality: 'ES', teamName: 'Aston Martin', birth: '1981-07-29' },
    { name: 'Lance Stroll', num: 18, nationality: 'CA', teamName: 'Aston Martin', birth: '1998-10-29' },
    { name: 'Pierre Gasly', num: 10, nationality: 'FR', teamName: 'Alpine', birth: '1996-02-07' },
    { name: 'Esteban Ocon', num: 31, nationality: 'FR', teamName: 'Alpine', birth: '1996-09-17' },
    { name: 'Alexander Albon', num: 23, nationality: 'TH', teamName: 'Williams', birth: '1996-03-23' },
    { name: 'Logan Sargeant', num: 2, nationality: 'US', teamName: 'Williams', birth: '2000-12-31' },
    { name: 'Yuki Tsunoda', num: 22, nationality: 'JP', teamName: 'RB', birth: '2000-05-11' },
    { name: 'Daniel Ricciardo', num: 3, nationality: 'AU', teamName: 'RB', birth: '1989-07-01' },
    { name: 'Valtteri Bottas', num: 77, nationality: 'FI', teamName: 'Kick Sauber', birth: '1989-08-28' },
    { name: 'Zhou Guanyu', num: 24, nationality: 'CN', teamName: 'Kick Sauber', birth: '1999-05-30' },
    { name: 'Kevin Magnussen', num: 20, nationality: 'DK', teamName: 'Haas', birth: '1992-08-05' },
    { name: 'Nico Hulkenberg', num: 27, nationality: 'DE', teamName: 'Haas', birth: '1987-08-19' },
  ];

  const pilotosF2 = [
    { name: 'Victor Martins', num: 1, nationality: 'FR', teamName: 'ART Grand Prix', birth: '2001-06-16' },
    { name: 'Zak O Sullivan', num: 2, nationality: 'GB', teamName: 'ART Grand Prix', birth: '2005-02-01' },
    { name: 'Oliver Bearman', num: 3, nationality: 'GB', teamName: 'Prema Racing', birth: '2005-05-08' },
    { name: 'Andrea Kimi Antonelli', num: 4, nationality: 'IT', teamName: 'Prema Racing', birth: '2006-08-25' },
    { name: 'Zane Maloney', num: 5, nationality: 'BB', teamName: 'Rodin Motorsport', birth: '2003-10-02' },
    { name: 'Ritomo Miyata', num: 6, nationality: 'JP', teamName: 'Rodin Motorsport', birth: '1999-08-10' },
    { name: 'Jak Crawford', num: 7, nationality: 'US', teamName: 'DAMS Lucas Oil', birth: '2005-05-02' },
    { name: 'Juan Manuel Correa', num: 8, nationality: 'US', teamName: 'DAMS Lucas Oil', birth: '1999-08-09' },
    { name: 'Kush Maini', num: 9, nationality: 'IN', teamName: 'Invicta Racing', birth: '2000-09-22' },
    { name: 'Gabriel Bortoleto', num: 10, nationality: 'BR', teamName: 'Invicta Racing', birth: '2004-10-14' },
    { name: 'Dennis Hauger', num: 11, nationality: 'NO', teamName: 'MP Motorsport', birth: '2003-03-17' },
    { name: 'Franco Colapinto', num: 12, nationality: 'AR', teamName: 'MP Motorsport', birth: '2003-05-27' },
    { name: 'Enzo Fittipaldi', num: 14, nationality: 'BR', teamName: 'Van Amersfoort Racing', birth: '2001-07-18' },
    { name: 'Rafael Villagómez', num: 15, nationality: 'MX', teamName: 'Van Amersfoort Racing', birth: '2001-11-10' },
    { name: 'Amaury Cordeel', num: 16, nationality: 'BE', teamName: 'Hitech Pulse-Eight', birth: '2002-07-09' },
    { name: 'Paul Aron', num: 17, nationality: 'EE', teamName: 'Hitech Pulse-Eight', birth: '2004-02-04' },
    { name: 'Isack Hadjar', num: 20, nationality: 'FR', teamName: 'Campos Racing', birth: '2004-09-28' },
    { name: 'Pepe Martí', num: 21, nationality: 'ES', teamName: 'Campos Racing', birth: '2005-06-13' },
    { name: 'Richard Verschoor', num: 22, nationality: 'NL', teamName: 'Trident', birth: '2000-12-16' },
    { name: 'Roman Stanek', num: 23, nationality: 'CZ', teamName: 'Trident', birth: '2004-02-25' },
    { name: 'Taylor Barnard', num: 24, nationality: 'GB', teamName: 'AIX Racing', birth: '2004-06-01' },
    { name: 'Joshua Dürksen', num: 25, nationality: 'PY', teamName: 'AIX Racing', birth: '2003-10-27' },
  ];

  for (const p of pilotosF1) {
    em.create(Piloto, {
      name: p.name,
      num: p.num,
      nationality: p.nationality,
      role: 'Titular',
      birth_date: new Date(p.birth),
      team: escuderias[p.teamName],
      racing_series: f1
    });
  }
  for (const p of pilotosF2) {
    em.create(Piloto, {
      name: p.name,
      num: p.num,
      nationality: p.nationality,
      role: 'Titular',
      birth_date: new Date(p.birth),
      team: escuderias[p.teamName],
      racing_series: f2
    });
  }

  console.log("Creando Circuitos y Carreras (Calendario Completo 2024)...");
  
  const circuitosData = [
    { name: 'Bahrain International Circuit', country: 'BH', length: '5.412 km', year: 2004 },
    { name: 'Jeddah Corniche Circuit', country: 'SA', length: '6.174 km', year: 2021 },
    { name: 'Albert Park Circuit', country: 'AU', length: '5.278 km', year: 1996 },
    { name: 'Suzuka International Racing Course', country: 'JP', length: '5.807 km', year: 1962 },
    { name: 'Shanghai International Circuit', country: 'CN', length: '5.451 km', year: 2004 },
    { name: 'Miami International Autodrome', country: 'US', length: '5.412 km', year: 2022 },
    { name: 'Autodromo Enzo e Dino Ferrari', country: 'IT', length: '4.909 km', year: 1953 },
    { name: 'Circuit de Monaco', country: 'MC', length: '3.337 km', year: 1929 },
    { name: 'Circuit Gilles-Villeneuve', country: 'CA', length: '4.361 km', year: 1978 },
    { name: 'Circuit de Barcelona-Catalunya', country: 'ES', length: '4.657 km', year: 1991 },
    { name: 'Red Bull Ring', country: 'AT', length: '4.318 km', year: 1969 },
    { name: 'Silverstone Circuit', country: 'GB', length: '5.891 km', year: 1948 },
    { name: 'Hungaroring', country: 'HU', length: '4.381 km', year: 1986 },
    { name: 'Circuit de Spa-Francorchamps', country: 'BE', length: '7.004 km', year: 1921 },
    { name: 'Circuit Zandvoort', country: 'NL', length: '4.259 km', year: 1948 },
    { name: 'Autodromo Nazionale Monza', country: 'IT', length: '5.793 km', year: 1922 },
    { name: 'Baku City Circuit', country: 'AZ', length: '6.003 km', year: 2016 },
    { name: 'Marina Bay Street Circuit', country: 'SG', length: '4.940 km', year: 2008 },
    { name: 'Circuit of the Americas', country: 'US', length: '5.513 km', year: 2012 },
    { name: 'Autódromo Hermanos Rodríguez', country: 'MX', length: '4.304 km', year: 1959 },
    { name: 'Autódromo José Carlos Pace', country: 'BR', length: '4.309 km', year: 1940 },
    { name: 'Las Vegas Strip Circuit', country: 'US', length: '6.201 km', year: 2023 },
    { name: 'Lusail International Circuit', country: 'QA', length: '5.419 km', year: 2004 },
    { name: 'Yas Marina Circuit', country: 'AE', length: '5.281 km', year: 2009 }
  ];

  const circuitos: Record<string, Circuito> = {};
  for (const c of circuitosData) {
    circuitos[c.name] = em.create(Circuito, c);
  }

  // Helper para generar sesiones (5 por carrera, simplificado para todos los GPs)
  function createSessionsForRace(carrera: Carrera, dateStr: string) {
    const baseDate = new Date(dateStr);
    
    // FP1 - Viernes
    const fp1Date = new Date(baseDate);
    fp1Date.setDate(fp1Date.getDate() - 2);
    fp1Date.setHours(13, 0, 0);
    const fp1End = new Date(fp1Date);
    fp1End.setHours(14, 0, 0);
    em.create(Sesion, { name: 'Free Practice 1', type: 'FP1', start_time: fp1Date, end_time: fp1End, race: carrera });

    // FP2 - Viernes
    const fp2Date = new Date(baseDate);
    fp2Date.setDate(fp2Date.getDate() - 2);
    fp2Date.setHours(17, 0, 0);
    const fp2End = new Date(fp2Date);
    fp2End.setHours(18, 0, 0);
    em.create(Sesion, { name: 'Free Practice 2', type: 'FP2', start_time: fp2Date, end_time: fp2End, race: carrera });

    // FP3 - Sábado
    const fp3Date = new Date(baseDate);
    fp3Date.setDate(fp3Date.getDate() - 1);
    fp3Date.setHours(12, 0, 0);
    const fp3End = new Date(fp3Date);
    fp3End.setHours(13, 0, 0);
    em.create(Sesion, { name: 'Free Practice 3', type: 'FP3', start_time: fp3Date, end_time: fp3End, race: carrera });

    // QUALY - Sábado
    const qDate = new Date(baseDate);
    qDate.setDate(qDate.getDate() - 1);
    qDate.setHours(16, 0, 0);
    const qEnd = new Date(qDate);
    qEnd.setHours(17, 0, 0);
    em.create(Sesion, { name: 'Qualifying', type: 'QUALY', start_time: qDate, end_time: qEnd, race: carrera });

    // RACE - Domingo
    const rDate = new Date(baseDate);
    rDate.setHours(15, 0, 0);
    const rEnd = new Date(rDate);
    rEnd.setHours(17, 0, 0);
    em.create(Sesion, { name: 'Race', type: 'RACE', start_time: rDate, end_time: rEnd, race: carrera });
  }

  // F1 Races (24)
  const f1Races = [
    { name: 'Bahrain Grand Prix', date: '2024-03-02', track: 'Bahrain International Circuit' },
    { name: 'Saudi Arabian Grand Prix', date: '2024-03-09', track: 'Jeddah Corniche Circuit' },
    { name: 'Australian Grand Prix', date: '2024-03-24', track: 'Albert Park Circuit' },
    { name: 'Japanese Grand Prix', date: '2024-04-07', track: 'Suzuka International Racing Course' },
    { name: 'Chinese Grand Prix', date: '2024-04-21', track: 'Shanghai International Circuit' },
    { name: 'Miami Grand Prix', date: '2024-05-05', track: 'Miami International Autodrome' },
    { name: 'Emilia Romagna Grand Prix', date: '2024-05-19', track: 'Autodromo Enzo e Dino Ferrari' },
    { name: 'Monaco Grand Prix', date: '2024-05-26', track: 'Circuit de Monaco' },
    { name: 'Canadian Grand Prix', date: '2024-06-09', track: 'Circuit Gilles-Villeneuve' },
    { name: 'Spanish Grand Prix', date: '2024-06-23', track: 'Circuit de Barcelona-Catalunya' },
    { name: 'Austrian Grand Prix', date: '2024-06-30', track: 'Red Bull Ring' },
    { name: 'British Grand Prix', date: '2024-07-07', track: 'Silverstone Circuit' },
    { name: 'Hungarian Grand Prix', date: '2024-07-21', track: 'Hungaroring' },
    { name: 'Belgian Grand Prix', date: '2024-07-28', track: 'Circuit de Spa-Francorchamps' },
    { name: 'Dutch Grand Prix', date: '2024-08-25', track: 'Circuit Zandvoort' },
    { name: 'Italian Grand Prix', date: '2024-09-01', track: 'Autodromo Nazionale Monza' },
    { name: 'Azerbaijan Grand Prix', date: '2024-09-15', track: 'Baku City Circuit' },
    { name: 'Singapore Grand Prix', date: '2024-09-22', track: 'Marina Bay Street Circuit' },
    { name: 'United States Grand Prix', date: '2024-10-20', track: 'Circuit of the Americas' },
    { name: 'Mexico City Grand Prix', date: '2024-10-27', track: 'Autódromo Hermanos Rodríguez' },
    { name: 'São Paulo Grand Prix', date: '2024-11-03', track: 'Autódromo José Carlos Pace' },
    { name: 'Las Vegas Grand Prix', date: '2024-11-23', track: 'Las Vegas Strip Circuit' },
    { name: 'Qatar Grand Prix', date: '2024-12-01', track: 'Lusail International Circuit' },
    { name: 'Abu Dhabi Grand Prix', date: '2024-12-08', track: 'Yas Marina Circuit' },
  ];

  let raceOffset = 0; // Para dar tiempos distintos a F2 si lo hicieramos, pero usaremos la misma baseDate con diffs para f2

  for (const r of f1Races) {
    const startDate = new Date(r.date);
    startDate.setDate(startDate.getDate() - 2); // Viernes
    const endDate = new Date(r.date); // Domingo
    
    const carrera = em.create(Carrera, {
      name: `${r.name} F1`,
      start_date: startDate,
      end_date: endDate,
      track: circuitos[r.track],
      season: t2024F1
    });

    createSessionsForRace(carrera, r.date);
  }

  // F2 Races (14) - Subset del calendario de F1
  const f2Races = f1Races.filter(r => [
    'Bahrain Grand Prix', 'Saudi Arabian Grand Prix', 'Australian Grand Prix', 
    'Emilia Romagna Grand Prix', 'Monaco Grand Prix', 'Spanish Grand Prix', 
    'Austrian Grand Prix', 'British Grand Prix', 'Hungarian Grand Prix', 
    'Belgian Grand Prix', 'Italian Grand Prix', 'Azerbaijan Grand Prix', 
    'Qatar Grand Prix', 'Abu Dhabi Grand Prix'
  ].includes(r.name));

  for (const r of f2Races) {
    const startDate = new Date(r.date);
    startDate.setDate(startDate.getDate() - 2);
    const endDate = new Date(r.date);
    
    const carrera = em.create(Carrera, {
      name: `${r.name} F2`,
      start_date: startDate,
      end_date: endDate,
      track: circuitos[r.track],
      season: t2024F2
    });

    // Sesiones para F2 (Practica, Clasificacion, Sprint, Carrera Principal)
    const baseDate = new Date(r.date);
    const pDate = new Date(baseDate); pDate.setDate(pDate.getDate() - 2); pDate.setHours(10,0,0);
    const pEnd = new Date(pDate); pEnd.setHours(11,0,0);
    em.create(Sesion, { name: 'F2 Practice', type: 'FP', start_time: pDate, end_time: pEnd, race: carrera });

    const qDate = new Date(baseDate); qDate.setDate(qDate.getDate() - 2); qDate.setHours(14,0,0);
    const qEnd = new Date(qDate); qEnd.setHours(15,0,0);
    em.create(Sesion, { name: 'F2 Qualifying', type: 'QUALY', start_time: qDate, end_time: qEnd, race: carrera });

    const sDate = new Date(baseDate); sDate.setDate(sDate.getDate() - 1); sDate.setHours(14,0,0);
    const sEnd = new Date(sDate); sEnd.setHours(15,0,0);
    em.create(Sesion, { name: 'F2 Sprint Race', type: 'SPRINT', start_time: sDate, end_time: sEnd, race: carrera });

    const fDate = new Date(baseDate); fDate.setHours(10,0,0);
    const fEnd = new Date(fDate); fEnd.setHours(11,0,0);
    em.create(Sesion, { name: 'F2 Feature Race', type: 'RACE', start_time: fDate, end_time: fEnd, race: carrera });
  }

  console.log("Guardando en la base de datos...");
  await em.flush();
  
  console.log("¡Base de datos inicializada con éxito (F1 y F2 Completas)!");
  
  await orm.close();
}

runSeeder().catch(err => {
  console.error("Error al ejecutar el seeder:", err);
  process.exit(1);
});