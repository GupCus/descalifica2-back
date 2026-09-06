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
