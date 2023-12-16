import jwt from "jsonwebtoken";
import { errorDictionary } from "../error/error.enum";
const JWT_SECRET = "jwtSECRET";

export const jwtValidation = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    const token = authHeader.split(" ")[1];
    const responseToken = jwt.verify(token, JWT_SECRET);
    req.user = responseToken;
    next();
  } catch (error) {
    res.status(500).json({error: errorDictionary['AUTHENTICATION_ERROR']});
  }
};