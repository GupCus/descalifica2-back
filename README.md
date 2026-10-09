# 🏎️ descalifica2-back 🏎️

# Trabajo Práctico para la cátedra Desarollo de Software en UTN FRRo

## 👥Integrantes

- 52818 - Barroso Bollero, Agustín
- 52962 - Taborda, Ignacio
- 52961 - Figueroa, Francisco Alejandro
- 52847 - Taborda, Santiago

**Cursado en:** ISI 303 2025.

## 📝 Descripción

Descalifica2 es un sitio web dedicado principalmente a la Fórmula 1, donde podrás consultar el calendario de carreras, acceder a información detallada sobre cada evento y mantenerte al día con las noticias sobre automovilismo. El objetivo del sitio es mantener informada a toda la comunidad interesada en el deporte, brindando las fechas de cada Gran Premio, dónde verlo en vivo, y datos sobre las escuderías participantes junto a sus pilotos, como los resultados de las carreras o el torneo. Los usuarios pueden crear un perfil personalizado, indicando su nombre, escuderías, circuitos y pilotos favoritos para adaptar su experiencia en la plataforma. Además, podrán participar en un foro donde intercambiar opiniones, debatir y compartir ideas con otros fanáticos de la Fórmula 1\.

## Instrucciones de Instalación y Ejecución

A continuación se detalla el paso a paso para poder levantar el proyecto de forma local, tanto el backend como el frontend.

### Prerrequisitos

Para poder correr este proyecto es necesario tener instalado:

- **Node.js** (versión indicada en `.node-version`).
- **fnm** para administrar la versión de node.
- **pnpm** como gestor de paquetes.
- **MySQL** 8.0+

---

1. **Usar la versión de node del proyecto:**

   ```bash
   fnm use --install-if-missing
   ```

2. **Variables de Entorno:**
   Copia el archivo de ejemplo para crear tus variables de entorno locales (en CMD usar `copy`).

   ```bash
   cp exampleenv.txt .env
   ```

   Completa el `.env`:

   ```env
   PORT=3000
   BDLOCATION=mysql://dsw:dsw@localhost:3306/descalifica2
   JWT_SECRET=una_clave_secreta
   EXPIRA_TOKEN=7d
   FRONTEND_URL=http://localhost:5173
   GOOGLE_KEY=
   TELEGRAM_BOT=
   BREVO_API_KEY=
   EMAIL_FROM=
   ```

   - `GOOGLE_KEY`: crear un ID de cliente OAuth 2.0 (aplicación web) con `http://localhost:5173` como origen autorizado. [Más info](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid?hl=es-419).
   - `TELEGRAM_BOT`: crear un bot y copiar su token. [Guía oficial de Telegram](https://core.telegram.org/bots/tutorial). En desarrollo el bot no se inicia, así que alcanza con cualquier valor.
   - `BREVO_API_KEY` y `EMAIL_FROM`: crear una API key en [Brevo](https://www.brevo.com/) para el envío de mails.

3. **Instalar dependencias:**

   ```bash
   pnpm install
   ```

4. **Crear el usuario de MySQL e importar el dump de la base de datos:**
   Ejecutar en orden los scripts dentro de [/dumpsbd](../dumpsbd): primero `creacion-usuario.sql` (crea la base y el usuario `dsw`/`dsw`) y luego `dumpbd.sql`.

   **o si deseas no importar la base de datos**
   dentro de MySQL, crear la base y el usuario con los datos que ingresaste en `BDLOCATION` (las tablas se generan solas al iniciar):

   ```sql
   CREATE DATABASE IF NOT EXISTS descalifica2;
   CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON descalifica2.* TO 'username'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. **Ejecutar el proyecto en desarrollo:**

   ```bash
   pnpm start:dev
   ```

   La API queda en `http://localhost:3000/api`

## ℹ️ Más información del proyecto

- Toda la documentación técnica y de instalación se encuentra en el proyecto principal [ Documentación del Proyecto ](https://github.com/GupCus/tpDSW/)
- 🛠️ **Tecnologías:** Node.js, TypeScript, Express, MikroORM con MySQL, JWT y bcrypt para autenticación, Google OAuth, Multer, Swagger, node-cron, Brevo (emails), bot de Telegram y la API de OpenF1.
- **Nuestro proposal:** [tp/proposal.md](https://github.com/GupCus/tpDSW/blob/main/proposal.md)
- **Repo front:** [descalifica2-front](https://github.com/GupCus/descalifica2-front)
