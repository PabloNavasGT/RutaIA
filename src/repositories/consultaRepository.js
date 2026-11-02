// src/repositories/consultaRepository.js
const mongoose = require('mongoose');

const consultaSchema = new mongoose.Schema({
  estudianteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Estudiante', 
    required: [true, 'Toda consulta debe pertenecer a un estudiante existente'] 
  },
  pregunta: { 
    type: String, 
    required: [true, 'La pregunta no puede estar vacía'],
    trim: true
  },
  estado: { 
    type: String, 
    required: true,
    enum: ['Pendiente', 'Respondida', 'Sin resultados', 'Error'], 
    default: 'Pendiente' 
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Consulta', consultaSchema);