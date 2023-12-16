import { errorDictionary } from "../error/error.enum.js";

export const authMiddleware = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({error: errorDictionary['AUTHENTICATION_ERROR']});
      }
      next();
    };
  };