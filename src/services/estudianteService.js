const Estudiante = require('../repositories/estudianteRepository');
const { EstudianteResponseDTO } = require('../dtos/estudianteDto');
const bcrypt = require('bcryptjs');

class EstudianteService {
  async registrarEstudiante(data) {
    const existe = await Estudiante.findOne({ email: data.email });
    if (existe) {
      const error = new Error('El correo electrónico ya se encuentra registrado.');
      error.statusCode = 400;
      throw error;
    }

    // Encriptar la contraseña antes de guardarla (Fallo #3 solucionado)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Reemplazar la contraseña plana por la encriptada
    const datosEstudiante = {
      ...data,
      password: hashedPassword
    };

    const nuevoEstudiante = new Estudiante(datosEstudiante);
    await nuevoEstudiante.save();
    return new EstudianteResponseDTO(nuevoEstudiante);
  }

  async obtenerTodos() {
    const estudiantes = await Estudiante.find();
    return estudiantes.map(e => new EstudianteResponseDTO(e));
  }
}

module.exports = new EstudianteService();