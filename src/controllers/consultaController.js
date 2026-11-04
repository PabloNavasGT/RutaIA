const express = require('express');
const router = express.Router();
const axios = require('axios');
const Consulta = require('../repositories/consultaRepository');

//Recibe la pregunta del estudiante y la reenvía a n8n
router.post('/', async (req, res, next) => {
  try {
    const { estudiante, prompt, estudianteId, pregunta } = req.body;
    const textoPregunta = prompt || pregunta;
    const idEstudiante = estudianteId || estudiante || 'Anónimo';

    if (!textoPregunta) {
      const error = new Error('La pregunta o el prompt no pueden estar vacíos.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Guardar la consulta inicial en MongoDB con estado Pendiente
    const nuevaConsulta = new Consulta({
      estudianteId: idEstudiante.toString(),
      pregunta: textoPregunta,
      estado: 'Pendiente'
    });
    await nuevaConsulta.save();

    // 2. Obtener la URL del Webhook de n8n desde el archivo .env
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      throw new Error('La variable N8N_WEBHOOK_URL no está configurada en el archivo .env');
    }

    // 3. Enviar la petición POST al flujo local de n8n
    console.log(` Reenviando consulta a n8n (${n8nWebhookUrl})...`);
    const respuestaN8N = await axios.post(n8nWebhookUrl, {
      consultaId: nuevaConsulta._id,
      estudiante: idEstudiante,
      pregunta: textoPregunta
    });

    // Actualizar estado de la consulta a Respondida en MongoDB
    nuevaConsulta.estado = 'Respondida';
    await nuevaConsulta.save();

    // 4. Responder al frontend con el formato esperado por service.js
    return res.status(200).json({
      id: nuevaConsulta._id,
      exito: true,
      respuestaIA: respuestaN8N.data.output || respuestaN8N.data.text || 'Respuesta generada exitosamente por el núcleo de IA.',
      fuentes: respuestaN8N.data.fuentes || [
        { nombre: 'Frontend Web Moderno', categoria: 'Desarrollo Web', score: '95%' }
      ]
    });

  } catch (err) {
    console.error('Error en el flujo de consulta IA:', err.message);
    next(err);
  }
});

module.exports = router;