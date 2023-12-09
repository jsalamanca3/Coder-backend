// Middleware de autorización
const authorizeMiddleware = (req, res, next) => {
    const userRole = req.user ? req.user.role : null;
    const isAdmin = userRole === 'admin';
    if (req.originalUrl.startsWith('/api/products')) {
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        if (!isAdmin) {
          return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
        }
      }
    } else if (req.originalUrl.startsWith('/api/chat')) {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ error: 'Debes iniciar sesión para enviar mensajes al chat.' });
      }
    } else if (req.originalUrl.startsWith('/api/cart')) {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ error: 'Debes iniciar sesión para agregar productos al carrito.' });
      }
    }
    next();
  };
  export default authorizeMiddleware;