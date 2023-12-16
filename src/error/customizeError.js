import { errorDictionary } from "./error.enum.js";

function customizeError(code, message) {
    return {
      code,
      message: message || errorDictionary[code] || 'Error desconocido',
    };
  }