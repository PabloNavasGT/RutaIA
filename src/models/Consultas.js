const mongoose = require('mongoose');

const consultaSchema = new mongoose.Schema({
  estudianteId: {
    type: String,
    required: true
  },
  textoPregunta: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'Procesada', 'Error'],
    default: 'Pendiente'
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Consulta', consultaSchema);