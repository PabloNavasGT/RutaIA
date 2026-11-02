const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre del curso es obligatorio'],
    trim: true 
  },
  descripcion: { 
    type: String, 
    required: [true, 'La descripción detallada es obligatoria'] 
  },
  categoria: { 
    type: String, 
    required: [true, 'La categoría es obligatoria'],
    index: true
  },
  nivel: { 
    type: String, 
    required: [true, 'El nivel del curso es obligatorio'], 
    enum: ['Principiante', 'Intermedio', 'Avanzado'],
    index: true
  },
  duracion: { 
    type: String, 
    required: [true, 'La duración es obligatoria'] 
  },
  estado: { 
    type: String, 
    enum: ['ACTIVO', 'INACTIVO'], 
    default: 'ACTIVO',
    index: true
  }
}, { timestamps: true });

// Prevenir recompilación del modelo si ya existe en memoria
const Curso = mongoose.models.Curso || mongoose.model('Curso', cursoSchema);

module.exports = Curso;