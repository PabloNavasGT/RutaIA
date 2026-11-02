// src/controllers/cursoController.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Curso = require('../repositories/cursoRepository');
const Consulta = require('../models/Consulta');

// RUTAS DE CURSOS

router.get('/', async (req, res, next) => {
  try {
    const { categoria, nivel } = req.query;
    let filtro = { estado: 'ACTIVO' };

    if (categoria && categoria !== 'TODAS') {
      filtro.categoria = categoria;
    }
    if (nivel && nivel !== 'TODOS') {
      filtro.nivel = nivel;
    }

    let cursos = await Curso.find(filtro);

    // Si la colección está vacía, sembramos los cursos iniciales
    if (cursos.length === 0 && !categoria && !nivel) {
      const cursosIniciales = [
        { 
          nombre: 'Frontend Web Moderno', 
          descripcion: 'HTML5, CSS3 Grid/Flexbox y JavaScript Vanilla avanzado para la construcción de interfaces web dinámicas y responsivas.', 
          categoria: 'Desarrollo Web', 
          nivel: 'Principiante', 
          duracion: '40 hrs', 
          estado: 'ACTIVO' 
        },
        { 
          nombre: 'Arquitectura Java Spring Boot', 
          descripcion: 'Desarrollo de Microservices, APIs RESTful robustas y gestión de seguridad con Spring Security orientada a entornos empresariales.', 
          categoria: 'Backend', 
          nivel: 'Intermedio', 
          duracion: '60 hrs', 
          estado: 'ACTIVO' 
        },
        { 
          nombre: 'Introducción a RAG e IA', 
          descripcion: 'Integración avanzada de Modelos de Lenguaje (LLMs), generación de embeddings vectoriales y conexión con bases de datos Qdrant.', 
          categoria: 'Inteligencia Artificial', 
          nivel: 'Avanzado', 
          duracion: '45 hrs', 
          estado: 'ACTIVO' 
        },
        { 
          nombre: 'PostgreSQL & Optimización', 
          descripcion: 'Diseño relacional avanzado, índices de alto rendimiento, transacciones atómicas y resolución de consultas SQL complejas.', 
          categoria: 'Base de Datos', 
          nivel: 'Intermedio', 
          duracion: '35 hrs', 
          estado: 'ACTIVO' 
        }
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
    const { nombre, descripcion, categoria, nivel, duracion } = req.body;

    if (!nombre || !descripcion) {
      const error = new Error('No podrán registrarse cursos sin nombre o descripción.');
      error.statusCode = 400;
      throw error;
    }

    const nuevoCurso = new Curso({
      nombre,
      descripcion,
      categoria,
      nivel,
      duracion,
      estado: 'ACTIVO'
    });

    await nuevoCurso.save();
    res.status(201).json({
      estado: 'Éxito',
      mensaje: 'Curso registrado dinámicamente en MongoDB',
      datos: nuevoCurso
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cursos/:id - Actualizar curso
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cursoActualizado = await Curso.findByIdAndUpdate(id, req.body, { 
      new: true, 
      runValidators: true 
    });

    if (!cursoActualizado) {
      const error = new Error('El curso especificado no existe.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      estado: 'Éxito',
      mensaje: 'Curso actualizado correctamente',
      datos: cursoActualizado
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cursos/:id/desactivar - Soft Delete
router.patch('/:id/desactivar', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cursoDesactivado = await Curso.findByIdAndUpdate(
      id, 
      { estado: 'INACTIVO' }, 
      { new: true }
    );

    if (!cursoDesactivado) {
      const error = new Error('El curso especificado no existe.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      estado: 'Éxito',
      mensaje: 'Curso desactivado correctamente del catálogo público',
      datos: cursoDesactivado
    });
  } catch (err) {
    next(err);
  }
});

// RUTA DE CONSULTAS E INTELIGENCIA ARTIFICIAL 

// POST /api/cursos/consultar (o la ruta que prefieras para la IA)
router.post('/consultar', async (req, res) => {
  try {
    const { estudianteId, pregunta } = req.body;

    if (!estudianteId || !pregunta) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (estudianteId o pregunta).' });
    }

    // 1. Guardar la consulta inicial en MongoDB con estado Pendiente (Auditoría)
    const nuevaConsulta = new Consulta({
      estudianteId,
      textoPregunta: pregunta,
      estado: 'Pendiente'
    });
    await nuevaConsulta.save();

    // 2. URL de tu Webhook de n8n
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://vegvisircamanante.app.n8n.cloud/webhook-test/54a7e99f-8640-40a0-b560-1d8136bb81b1';

    // 3. Enviar la petición al flujo de n8n
    const respuestaN8N = await axios.post(n8nWebhookUrl, {
      consultaId: nuevaConsulta._id,
      estudianteId,
      pregunta
    });

    // 4. Responder al frontend con el resultado procesado por la IA
    return res.status(200).json({
      exito: true,
      mensaje: 'Consulta procesada correctamente por la IA',
      data: respuestaN8N.data
    });

  } catch (error) {
    console.error('Error al conectar con el Webhook de n8n:', error.message);
    return res.status(500).json({
      error: 'Hubo un problema al procesar la recomendación con la IA.'
    });
  }
});

module.exports = router;