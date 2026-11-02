// src/repositories/calificacionRepository.js
const mongoose = require('mongoose');

const calificacionSchema = new mongoose.Schema({
  recomendacionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Recomendacion', 
    required: [true, 'La recomendación a calificar es obligatoria'],
    unique: true // Restricción: Una sola calificación por recomendación
  },
  puntuacion: { 
    type: Number, 
    required: [true, 'La puntuación es obligatoria'], 
    min: [1, 'La puntuación mínima es 1'], 
    max: [5, 'La puntuación máxima es 5'] 
  },
  comentario: { 
    type: String,
    trim: true 
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Calificacion', calificacionSchema);