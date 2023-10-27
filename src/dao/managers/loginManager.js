function checkUserRole(role) {
    return (req, res, next) => {
      if (req.session && req.session.userRole === role) {
        next();
      } else {
        res.status(403).send('Acceso no autorizado');
      }
    };
  }

export default checkUserRole;