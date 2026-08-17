import { destruirbd_importaropenf1 } from './openf1.service.js';

console.log("Iniciando ejecución manual de la importación...");

destruirbd_importaropenf1()
  .then(() => {
    console.log("El proceso ha finalizado correctamente.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Hubo un error crítico durante la ejecución:", error);
    process.exit(1);
  });
