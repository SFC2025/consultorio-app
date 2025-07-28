const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // corta en 5s si no encuentra el cluster
    });
    mongoose.set('bufferCommands', false); // no bufferiza si se pierde la conexión
    console.log('MongoDB conectado con éxito');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
