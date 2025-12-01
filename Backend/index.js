require('dotenv').config();

console.log('Variável MONGODB_URI lida:', process.env.MONGODB_URI);

const express = require('express')
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/BookRoutes');
const compression = require('compression');
const cors = require('cors');

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); 

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {

      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

app.use(compression());

app.get("/", (req, res) => {
    res.send("API rodando!");
});

app.use('/api', authRoutes);
app.use('/api', bookRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });