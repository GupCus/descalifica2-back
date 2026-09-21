import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'API descalifica2',
    version: '1.0.0',
    description: 'Documentación actual de la API',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Desarrollo',
    },
    {
      url: 'https://descalifica2.up.railway.app',
      description: 'Production',
    },
  ],
};

const outputFile = './src/shared/swagger/swagger-output.json';
const routes = ['./app.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);
