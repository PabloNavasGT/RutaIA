const express = require('express');
const router = express.Router();
const estudianteService = require('../services/estudianteService');
const Consulta = require('../repositories/consultaRepository');

// Registrar un nuevo estudiante (RF 01)
router.post('/', async (req, res, next) => {
  try {
    const nuevoEstudiante = await estudianteService.registrarEstudiante(req.body);
    res.status(201).json({
      estado: 'Éxito',
      mensaje: 'Estudiante registrado correctamente en MongoDB',
      datos: nuevoEstudiante
    });
  } catch (err) {
    next(err);
  }
});

// Obtener todos los estudiantes
router.get('/', async (req, res, next) => {
  try {
    const estudiantes = await estudianteService.obtenerTodos();
    res.status(200).json(estudiantes);
  } catch (err) {
    next(err);
  }
});

//Consultar historial de un estudiante (RF 02 / RF 16)
router.get('/:id/historial', async (req, res, next) => {
  try {
    const { id } = req.params;
    const consultas = await Consulta.find({ estudianteId: id }).sort({ fecha: -1 });
    res.status(200).json({
      estado: 'Éxito',
      totalConsultas: consultas.length,
      historial: consultas
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;