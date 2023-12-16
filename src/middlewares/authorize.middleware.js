import { errorDictionary } from "../error/error.enum.js";
// Middleware de autorización
const authorizeMiddleware = (req, res, next) => {
    const userRole = req.user ? req.user.role : null;
    const isAdmin = userRole === 'admin';
    if (req.originalUrl.startsWith('/api/products')) {
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        if (!isAdmin) {
          return res.status(403).json({error: errorDictionary['ACCESS_DANIED']});
        }
      }
    } else if (req.originalUrl.startsWith('/api/chat')) {
      if (!req.isAuthenticated()) {
        return res.status(403).json({error: errorDictionary['UNAUTHORIZED_ERROR']});
      }
    } else if (req.originalUrl.startsWith('/api/cart')) {
      if (!req.isAuthenticated()) {
        return res.status(403).json({error: errorDictionary['UNAUTHORIZED_ERROR']});
      }
    }
    next();
  };
  export default authorizeMiddleware;