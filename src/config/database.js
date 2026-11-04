const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Conexión a MongoDB 
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rutaia', {
      // Las versiones recientes de Mongoose gestionan la conexión de forma nativa
    });
    
    console.log(` MongoDB Conectado exitosamente: ${conn.connection.host}`);
  } catch (error) {
    console.error(` UUps!!, error al conectar a MongoDB: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;