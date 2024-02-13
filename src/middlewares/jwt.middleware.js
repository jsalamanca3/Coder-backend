import jwt from "jsonwebtoken";
import { errorDictionary } from "../error/error.enum.js";
import { usersModel } from "../models/users.model.js";

const JWT_SECRET = "jwtSECRET";

export const jwtValidation = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: errorDictionary['UNAUTHORIZED_ERROR'] });
    }
    const token = authHeader.split(" ")[1];
    const responseToken = jwt.verify(token, JWT_SECRET);

    const user = await usersModel.findById(responseToken.userId);
    req.session.userId = user._id;
    req.session.userRole = user.role;

    next();
  } catch (error) {
    res.status(500).json({ error: errorDictionary['AUTHENTICATION_ERROR'] });
  }
};
