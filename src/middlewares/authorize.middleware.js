import { errorDictionary } from "../error/error.enum.js";

// Middleware de autorización
const authorizeMiddleware = async (req, res, next) => {
  const userRole = req.user ? req.user.role : null;
  const isAdmin = userRole === 'admin';
  const isPremium = userRole === 'premium';

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
  }

  next();
};

export default authorizeMiddleware;