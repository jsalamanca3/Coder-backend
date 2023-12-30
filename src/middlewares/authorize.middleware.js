import { errorDictionary } from "../error/error.enum.js";
import logger from "../winston.js";

// Middleware de autorización
const authorizeMiddleware = async (req, res, next) => {
  const userRole = req.user ? req.user.role : null;

  console.log('Rol del usuario:', userRole);

  const isAdmin = userRole === 'admin';
  const isPremium = userRole === 'premium';

  try{
    if (req.originalUrl.startsWith('/api/products')) {
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        if (!isAdmin) {
          return res.status(403).json({ error: errorDictionary['ACCESS_DENIED'] });
        }
        if (req.method === 'DELETE') {
          if (isPremium) {
            const productId = req.params.pid;
            const product = await productsModel.findById(productId);
            if (product.owner !== req.user._id) {
              return res.status(403).json({ error: errorDictionary['ACCESS_DENIED'] });
            }
          }
        }
      }
    } else if (req.originalUrl.startsWith('/api/chat')) {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ error: errorDictionary['UNAUTHORIZED_ERROR'] });
      }
    } else if (req.originalUrl.startsWith('/api/cart')) {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ error: errorDictionary['UNAUTHORIZED_ERROR'] });
      }
    } else if (req.originalUrl.startsWith('/api/createproduct')) {
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        if (!(isAdmin || isPremium)) {
          return res.status(403).json({ error: errorDictionary['ACCESS_DENIED'], message: 'No tiene permiso para crear productos' });
        }
      }
    }

    next();

  } catch (error) {
    logger.error('Error en authorizeMiddleware:', error);
    res.status(500).json({ error: 'Error en el middleware de autorización', details: error.message });
  }
};

export default authorizeMiddleware;