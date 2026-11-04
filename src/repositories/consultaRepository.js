// src/repositories/consultaRepository.js
const mongoose = require('mongoose');

const consultaSchema = new mongoose.Schema({
  estudianteId: { 
    type: String, // ✅ Cambiado a String para aceptar nombres o identificadores de texto libre
    required: [true, 'Toda consulta debe pertenecer a un estudiante'] 
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