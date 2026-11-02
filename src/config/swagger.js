const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RutaIA API - Documentación Hextech',
      version: '1.0.0',
      description: 'API REST desarrollada en Node.js y MongoDB para el sistema de recomendación RutaIA',
    },
    servers: [{ url: 'http://localhost:8080' }],
  },
  apis: ['./src/controllers/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = { swaggerUi, specs };