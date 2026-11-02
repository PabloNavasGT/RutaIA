// src/controllers/cursoController.js
const express = require('express');
const router = express.Router();
const Curso = require('../repositories/cursoRepository');

// GET /api/cursos - Listar cursos activos (con filtros opcionales por categoría y nivel)
router.get('/', async (req, res, next) => {
  try {
    const { categoria, nivel } = req.query;
    let filtro = { estado: 'ACTIVO' };

    if (categoria && categoria !== 'TODAS') filtro.categoria = categoria;
    if (nivel && nivel !== 'TODOS') filtro.nivel = nivel;

    let cursos = await Curso.find(filtro);

    // Si la BD está completamente vacía, sembramos los datos iniciales obligatorios
    if (cursos.length === 0 && !categoria && !nivel) {
      const cursosIniciales = [
        { nombre: 'Frontend Web Moderno', descripcion: 'HTML5, CSS3 Grid/Flexbox y JavaScript Vanilla avanzado para interfaces web dinámicas.', categoria: 'Desarrollo Web', nivel: 'Principiante', duracion: '40 hrs', estado: 'ACTIVO' },
        { nombre: 'Arquitectura Java Spring Boot', descripcion: 'Desarrollo de Microservicios y APIs RESTful robustas orientadas a servicios empresariales.', categoria: 'Backend', nivel: 'Intermedio', duracion: '60 hrs', estado: 'ACTIVO' },
        { nombre: 'Introducción a RAG e IA', descripcion: 'Integración de LLMs, Embeddings y Bases de Datos Vectoriales en arquitecturas modernas.', categoria: 'Inteligencia Artificial', nivel: 'Avanzado', duracion: '45 hrs', estado: 'ACTIVO' },
        { nombre: 'PostgreSQL & Optimización', descripcion: 'Diseño relacional avanzado, índices de alto rendimiento y consultas complejas de base de datos.', categoria: 'Base de Datos', nivel: 'Intermedio', duracion: '35 hrs', estado: 'ACTIVO' }
      ];
      cursos = await Curso.insertMany(cursosIniciales);
    }

    res.status(200).json(cursos);
  } catch (err) {
    next(err);
  }
});

// POST /api/cursos - Registrar un nuevo curso
router.post('/', async (req, res, next) => {
  try {
    const nuevoCurso = new Curso(req.body);
    await nuevoCurso.save();
    res.status(201).json({
      estado: 'Éxito',
      mensaje: 'Curso registrado correctamente',
      datos: nuevoCurso
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;