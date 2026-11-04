const mongoose = require('mongoose');

const claseSchema = new mongoose.Schema({
  numero: { type: Number, required: true },
  titulo: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true },
  puntuacion: { type: Number, default: 0, min: 0, max: 5 }
}, { _id: true });

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
  },
  clases: [claseSchema]
}, { timestamps: true });

const Curso = mongoose.models.Curso || mongoose.model('Curso', cursoSchema);

module.exports = Curso;