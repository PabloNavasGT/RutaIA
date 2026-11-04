// src/app.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const Consulta = require('./repositories/consultaRepository');
const { specs: swaggerSpec } = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');

const estudianteController = require('./controllers/estudianteController');
const cursoController = require('./controllers/cursoController');
const consultaController = require('./controllers/consultaController');

require('dotenv').config();

const app = express();

// Configuración robusta de CORS para admitir Live Server en cualquier puerto
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
connectDB();

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API REST
app.use('/api/estudiantes', estudianteController);
app.use('/api/cursos', cursoController);
app.use('/api/consultas', consultaController);

// Middleware global de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
  console.log(`📚 Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
});