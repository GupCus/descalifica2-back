import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import "dotenv/config";

//Crea un cliente de google que valida el key que nos vino del front (no el jwt)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_KEY;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const loginGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Iniciar sesión con Google OAuth'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { token: { type: 'string', description: 'JWT (Credential) devuelto por Google Sign-In en el frontend' } }
    }
    #swagger.responses[200] = { description: 'Sesión iniciada con éxito', schema: { token: 'string', user: { $ref: '#/components/schemas/Usuario' } } }
    #swagger.responses[401] = { description: 'Token de Google inválido o expirado' }
    #swagger.responses[404] = { 
      description: 'Usuario no registrado. Requiere registro.',
      schema: { 
        message: 'Usuario de gauth no registrado...',
        action: 'REQUIERE_REGISTRO',
        prefillData: { email: 'string', name: 'string', surname: 'string', avatar: 'string' }
      }
    }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  const { token } = req.body;
  try {
    // Chequea con la cloud de google si el token es legitimo digamos
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    //Extraemos los datos en el cuerpo de la response (asi lo hace express)
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: "Token inválido" });
    }
    res.locals.googlePayload = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};
