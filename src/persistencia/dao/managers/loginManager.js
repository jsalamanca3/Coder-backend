import { errorDictionary } from "../../../error/error.enum.js";

function checkUserRole(role) {
  return (req, res, next) => {
    if (req.session && req.session.userRole === role) {
      next();
    } else {
      res.status(403).send({error: errorDictionary['AUTHENTICATION_ERROR']});
    }
  };
}

export default checkUserRole;