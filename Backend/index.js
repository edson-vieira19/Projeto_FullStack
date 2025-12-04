require('dotenv').config();

const express = require('express')
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/BookRoutes');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const sanitizer = require('perfect-express-sanitizer');

const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Muitas requisições feitas a partir deste IP, tente novamente após 15 minutos.'
});

const loginLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minuto
	max: 5, // 5 tentativas por IP a cada minuto
    message: { msg: 'Muitas tentativas de login a partir deste IP. Tente novamente após 1 minuto.' },
    standardHeaders: true, 
    legacyHeaders: false
});

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

app.use(sanitizer.clean({
    xss: true,
    noSql: true,
    sql: true,
    sqlLevel: 5,
    noSqlLevel: 5,
    allowedKeys: ['thumbnail']
}));

app.use(compression());

app.use(globalLimiter);

app.use('/api/login', loginLimiter);

app.get("/", (req, res) => {
    res.send("API rodando!");
});

app.use('/api', authRoutes);

app.use('/api', bookRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });