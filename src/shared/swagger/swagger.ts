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
  tags: [
    { name: 'Auth', description: 'Autenticación y Autorización' },
    { name: 'Usuarios', description: 'Gestión de usuarios' },

    {
      name: 'Categorías',
      description: 'Categorías (ej. F1, F2)',
    },
    { name: 'Temporadas', description: 'Temporadas de las categorías' },
    { name: 'Pilotos', description: 'Gestión de pilotos' },
    { name: 'Escuderias', description: 'Gestión de escuderías (equipos)' },
    { name: 'Carreras', description: 'Eventos de Grandes Premios' },
    { name: 'Sesiones', description: 'Sesiones de fin de semana de F1' },
    { name: 'Circuitos', description: 'Circuitos de carreras' },
    { name: 'Championships', description: 'Puntos del torneo' },
    { name: 'Marcas', description: 'Marcas o fabricantes de motores' },

    { name: 'Foro: Blogposts', description: 'Publicaciones y noticias' },
    { name: 'Foro: Comentarios', description: 'Comentarios de los usuarios' },

    {
      name: 'Servicios: Telegram',
      description: 'Integración con Bot de Telegram',
    },
    {
      name: 'Servicios: OpenF1',
      description: 'Sincronización con API pública OpenF1Api',
    },

    { name: 'Assets', description: 'Sistema de archivos multimedia' },
    { name: 'Nacionalidades', description: 'Nacionalidades disponibles' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorServer: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Internal server error' },
        },
      },
      NotFound: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Resource not found' },
        },
      },
      Piloto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Franco Colapinto' },
          num: { type: 'integer', nullable: true, example: 43 },
          nationality: {
            type: 'string',
            nullable: true,
            example: 'ARG (codigo IOC)',
          },
          birth_date: {
            type: 'string',
            format: 'date',
            nullable: true,
            example: '2003-05-27',
          },
          profile_image_url: {
            type: 'string',
            nullable: true,
            example: 'http://localhost:3000/uploads/pilotos/franco.jpg',
          },
          team: { type: 'integer', example: 1 },
          racing_series: { type: 'integer', nullable: true, example: 1 },
          season: { type: 'integer', nullable: true, example: 1 },
        },
      },
      PilotoInput: {
        type: 'object',
        required: ['name', 'team'],
        properties: {
          name: { type: 'string', example: 'Franco Colapinto' },
          team: { type: 'integer', example: 1 },
          num: { type: 'integer', example: 43 },
          nationality: { type: 'string', example: 'ARG (codigo IOC)' },
          birth_date: { type: 'string', format: 'date', example: '2003-05-27' },
          racing_series: { type: 'integer', example: 1 },
          season: { type: 'integer', example: 1 },
        },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Agustin' },
          username: { type: 'string', example: 'agus2001' },
          email: { type: 'string', example: 'agus@gmail.com' },
          user_type: { type: 'string', example: 'user' },
          surname: { type: 'string', nullable: true, example: 'Perez' },
          date_of_birth: {
            type: 'string',
            format: 'date',
            nullable: true,
            example: '2001-01-01',
          },
          fav_driver: {
            type: 'string',
            nullable: true,
            example: 'Franco Colapinto',
          },
          fav_team: { type: 'string', nullable: true, example: 'Williams' },
          bio: { type: 'string', nullable: true, example: 'Fan de la F1' },
          avatar_url: {
            type: 'string',
            nullable: true,
            example: 'http://localhost:3000/uploads/usuarios/avatar.jpg',
          },
          telegram_username: {
            type: 'string',
            nullable: true,
            example: 'agus_f1',
          },
        },
      },
      UsuarioInput: {
        type: 'object',
        required: ['name', 'email', 'password', 'user_type'],
        properties: {
          name: { type: 'string', example: 'Fran' },
          surname: { type: 'string', example: 'Perez' },
          username: { type: 'string', example: 'agus2001' },
          email: { type: 'string', example: 'agus@gmail.com' },
          password: { type: 'string', example: 'contra' },
          user_type: { type: 'string', example: 'user' },
          date_of_birth: {
            type: 'string',
            format: 'date',
            example: '2001-01-01',
          },
          fav_driver: { type: 'string', example: 'Franco Colapinto' },
          fav_team: { type: 'string', example: 'Williams' },
          bio: { type: 'string', example: 'Fan de la F1' },
          telegram_username: { type: 'string', example: 'agus_f1' },
        },
      },
      Escuderia: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Williams Racing' },
          fundation: { type: 'integer', nullable: true, example: 1977 },
          nationality: { type: 'string', nullable: true, example: 'GB' },
          color: { type: 'string', nullable: true, example: '#00A0EB' },
          engine: { type: 'string', nullable: true, example: 'Mercedes' },
          desc: {
            type: 'string',
            nullable: true,
            example: 'Equipo de franquito',
          },
          brand: { type: 'integer', nullable: true, example: 1 },
          racing_series: { type: 'integer', nullable: true, example: 1 },
        },
      },
      EscuderiaInput: {
        type: 'object',
        required: ['name', 'racing_series'],
        properties: {
          name: { type: 'string', example: 'Williams Racing' },
          fundation: { type: 'integer', example: 1977 },
          nationality: { type: 'string', example: 'GB' },
          color: { type: 'string', example: '#00A0EB' },
          engine: { type: 'integer', example: 3 },
          desc: { type: 'string', example: 'Equipo de franquito' },
          brand: { type: 'integer', example: 1 },
          racing_series: { type: 'integer', example: 1 },
        },
      },
      Categoria: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Fórmula 1' },
          description: { type: 'string', nullable: true, example: '' },
          logo_image: { type: 'string', nullable: true, example: 'logo.png' },
        },
      },
      CategoriaInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Fórmula 1' },
          description: { type: 'string', example: '' },
        },
      },
      Carrera: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Gran Premio de Mónaco' },
          date: {
            type: 'string',
            format: 'date',
            nullable: true,
            example: '2024-05-26',
          },
        },
      },
      CarreraInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Gran Premio de Mónaco' },
        },
      },
      Circuito: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Circuito de Mónaco' },
          length: { type: 'number', nullable: true, example: 3.337 },
          location: { type: 'string', nullable: true, example: 'Mónaco' },
        },
      },
      CircuitoInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Circuito de Mónaco' },
          length: { type: 'number', example: 3.337 },
        },
      },
      Marca: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Ferrari' },
          foundation: { type: 'integer', nullable: true, example: 1947 },
        },
      },
      MarcaInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Ferrari' },
          foundation: { type: 'integer', example: 1947 },
        },
      },
      Temporada: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          year: { type: 'integer', example: 2024 },
          racing_series: { type: 'integer', example: 1 },
        },
      },
      TemporadaInput: {
        type: 'object',
        required: ['year', 'racing_series'],
        properties: {
          year: { type: 'integer', example: 2024 },
          racing_series: { type: 'integer', example: 1 },
        },
      },
      Sesion: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'FP1|FP2|FP3|SQ|Sprint|Q|GP' },
          start_time: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-05-25T14:00:00Z',
          },
        },
      },
      SesionInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'FP1|FP2|FP3|SQ|Sprint|Q|GP' },
          start_time: {
            type: 'string',
            format: 'date-time',
            example: '2024-05-25T14:00:00Z',
          },
        },
      },
      Blogpost: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Nuevo post' },
          content: { type: 'string', example: 'Contenido' },
        },
      },
      BlogpostInput: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string', example: 'Nuevo post' },
          content: { type: 'string', example: 'Contenido' },
        },
      },
      ComentarioPost: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          content: { type: 'string', example: 'Muy buen artículo' },
          post: { type: 'integer', example: 1 },
          author: { type: 'integer', example: 1 },
        },
      },
      ComentarioPostInput: {
        type: 'object',
        required: ['content', 'post'],
        properties: {
          content: { type: 'string', example: 'Muy buen artículo' },
          post: { type: 'integer', example: 1 },
        },
      },
      Team_Championship: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          points: { type: 'number', example: 25 },
          position: { type: 'integer', example: 1 },
          escuderia: { type: 'integer', example: 1 },
          season: { type: 'integer', example: 1 },
        },
      },
      Driver_Championship: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          points: { type: 'number', example: 25 },
          position: { type: 'integer', example: 1 },
          piloto: { type: 'integer', example: 1 },
          season: { type: 'integer', example: 1 },
        },
      },
    },
  },
};

const outputFile = './src/shared/swagger/swagger-output.json';
const routes = ['./app.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);
