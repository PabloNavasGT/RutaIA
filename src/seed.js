// src/seed.js
const mongoose = require('mongoose');
const Curso = require('./repositories/cursoRepository');
require('dotenv').config();

// Conexión a MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rutaia';

// Función para generar 10 clases por curso
const generarClases = (nombreCurso) => [
  { numero: 1, titulo: `Introducción a ${nombreCurso}`, descripcion: 'Fundamentos iniciales, configuración del entorno de trabajo y arquitectura base.', puntuacion: 0 },
  { numero: 2, titulo: 'Sintaxis Esencial y Estructura', descripcion: 'Conceptos clave, sintaxis fundamental, palabras reservadas y buenas prácticas.', puntuacion: 0 },
  { numero: 3, titulo: 'Manejo de Datos y Variables', descripcion: 'Tipos de datos primarios, estructuras complejas y mutabilidad.', puntuacion: 0 },
  { numero: 4, titulo: 'Flujos de Control y Decisiones', descripcion: 'Estructuras condicionales, bucles y control de ejecuciones complejas.', puntuacion: 0 },
  { numero: 5, titulo: 'Funciones y Modularización', descripcion: 'Declaración de funciones, scope, funciones puras y reutilización de código.', puntuacion: 0 },
  { numero: 6, titulo: 'Estructuras de Datos Avanzadas', descripcion: 'Manipulación de colecciones, arreglos y objetos avanzados.', puntuacion: 0 },
  { numero: 7, titulo: 'Manejo de Errores y Depuración', descripcion: 'Captura de excepciones, bloques try-catch y técnicas de debugging.', puntuacion: 0 },
  { numero: 8, titulo: 'Asincronía y Concurrencia', descripcion: 'Promesas, async/await y manejo eficiente de operaciones asíncronas.', puntuacion: 0 },
  { numero: 9, titulo: 'Integración con APIs y Servicios', descripcion: 'Consumo y envío de datos mediante peticiones HTTP/REST.', puntuacion: 0 },
  { numero: 10, titulo: 'Proyecto Final y Despliegue', descripcion: 'Construcción y publicación de una aplicación completa lista para producción.', puntuacion: 0 }
];

const cursosNuevos = [
  {
    nombre: 'Frontend Web Moderno',
    descripcion: 'Aprende HTML5, CSS3 Grid/Flexbox, Tailwind CSS y JavaScript Vanilla avanzado para construir interfaces web espectaculares.',
    categoria: 'Desarrollo Web',
    nivel: 'Principiante',
    duracion: '40 hrs',
    estado: 'ACTIVO',
    clases: generarClases('Frontend Web Moderno')
  },
  {
    nombre: 'Arquitectura Java Spring Boot',
    descripcion: 'Domina el desarrollo de Microservicios, APIs RESTful robustas y persistencia JPA/Hibernate para entornos empresariales.',
    categoria: 'Backend',
    nivel: 'Intermedio',
    duracion: '60 hrs',
    estado: 'ACTIVO',
    clases: generarClases('Spring Boot')
  },
  {
    nombre: 'Introducción a RAG e IA',
    descripcion: 'Integra LLMs de Google Gemini, Embeddings y Bases de Datos Vectoriales Qdrant en sistemas inteligentes modernos.',
    categoria: 'Inteligencia Artificial',
    nivel: 'Avanzado',
    duracion: '45 hrs',
    estado: 'ACTIVO',
    clases: generarClases('RAG e IA')
  },
  {
    nombre: 'PostgreSQL & Optimización',
    descripcion: 'Aprende diseño relacional avanzado, indexación de alto rendimiento, vistas materializadas y optimización de consultas SQL.',
    categoria: 'Base de Datos',
    nivel: 'Intermedio',
    duracion: '35 hrs',
    estado: 'ACTIVO',
    clases: generarClases('PostgreSQL')
  },
  {
    nombre: 'Node.js & Express API Engine',
    descripcion: 'Construye servidores escalables, arquitecturas de software por capas y middlewares de autenticación segura.',
    categoria: 'Backend',
    nivel: 'Principiante',
    duracion: '50 hrs',
    estado: 'ACTIVO',
    clases: generarClases('Node.js & Express')
  },
  {
    nombre: 'Ciberseguridad Ofensiva Web',
    descripcion: 'Aprende a identificar vulnerabilidades OWASP Top 10, pentesting y aseguramiento de aplicaciones web.',
    categoria: 'Inteligencia Artificial',
    nivel: 'Avanzado',
    duracion: '55 hrs',
    estado: 'ACTIVO',
    clases: generarClases('Ciberseguridad')
  },
  {
    nombre: 'Desarrollo Mobile con React Native',
    descripcion: 'Crea aplicaciones nativas multiplataforma para iOS y Android utilizando JavaScript y React.',
    categoria: 'Desarrollo Web',
    nivel: 'Intermedio',
    duracion: '50 hrs',
    estado: 'ACTIVO',
    clases: generarClases('React Native')
  }
];

const poblarBaseDeDatos = async () => {
  try {
    console.log(' Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log(' Conectado a MongoDB.');

    console.log(' Limpiando colección anterior de cursos...');
    await Curso.deleteMany({});

    console.log('Poblando 7 cursos completos con 10 clases cada uno...');
    const insertados = await Curso.insertMany(cursosNuevos);

    console.log(` ¡Éxito! Se insertaron ${insertados.length} cursos correctamente en MongoDB.`);
    process.exit(0);
  } catch (error) {
    console.error(' Error al poblar MongoDB:', error.message);
    process.exit(1);
  }
};

poblarBaseDeDatos();