import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import { __dirname } from '../utils.js';

const docsDir = path.join(__dirname, 'docs');
const yamlFiles = fs.readdirSync(docsDir).filter(file => file.endsWith('.yaml'));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Mi Proyecto',
      version: '1.0.0',
      description: 'Documentación de la API de Mi Proyecto de CoderHouse BackEnd',
    },
  },
  apis: yamlFiles.map(file => path.join(docsDir, file)),
};

const swaggerSetup = swaggerJSDoc(swaggerOptions);

export { swaggerSetup };
