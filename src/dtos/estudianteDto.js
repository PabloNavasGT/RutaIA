// src/dtos/estudianteDto.js
class EstudianteResponseDTO {
  constructor(estudiante) {
    this.id = estudiante._id;
    this.nombreCompleto = estudiante.nombreCompleto;
    this.email = estudiante.email;
    this.nivelExperiencia = estudiante.nivelExperiencia;
    this.areaInteres = estudiante.areaInteres;
  }
}

module.exports = { EstudianteResponseDTO };