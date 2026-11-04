const mongoose = require('mongoose');

const estudianteSchema = new mongoose.Schema({
  nombreCompleto: { 
    type: String, 
    required: [true, 'El nombre completo es obligatorio'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'El correo electrónico es obligatorio'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un correo electrónico válido']
  },
  password: { 
    type: String, 
    required: [true, 'La contraseña es obligatoria'] 
  },
  nivelExperiencia: { 
    type: String, 
    required: [true, 'El nivel de experiencia es obligatorio'], 
    enum: {
      values: ['Principiante', 'Intermedio', 'Avanzado'],
      message: 'El nivel debe ser: Principiante, Intermedio o Avanzado'
    }
  },
  areaInteres: { 
    type: String, 
    required: [true, 'El área de interés es obligatoria'],
    trim: true
  },comidaFavorita: { 
    type: String, 
    required: [true, 'La comida favorita es obligatoria'],
    lowercase: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Estudiante', estudianteSchema);