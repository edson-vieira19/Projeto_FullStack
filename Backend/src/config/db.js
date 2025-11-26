const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado com sucesso!');
  } catch (err) {
    console.error('Falha na conexão com o MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;





