// src/repositories/recomendacionRepository.js
const mongoose = require('mongoose');

const fuenteSchema = new mongoose.Schema({
  cursoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Curso', 
    required: true 
  },
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  score: { type: String, required: true }
}, { _id: false });

const recomendacionSchema = new mongoose.Schema({
  consultaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Consulta', 
    required: [true, 'La recomendación debe estar ligada a una consulta'] 
  },
  respuestaIA: { 
    type: String, 
    required: [true, 'La respuesta de la IA es obligatoria'] 
  },
  fuentes: [fuenteSchema],
  fecha: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Recomendacion', recomendacionSchema);