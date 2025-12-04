const mongoose = require('mongoose');
const logger = require('./logger');

const MONGO_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
     const options = { 
      //Opções de Pool de Conexões
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
     }

    await mongoose.connect(MONGO_URI,options);

    logger.info(`MongoDB conectado com sucesso! Pool Size: ${options.maxPoolSize}`);
  } catch (err) {
    logger.error(`Falha na conexão com o MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;





