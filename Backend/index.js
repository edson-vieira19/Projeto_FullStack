const express = require('express')
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const compression = require('compression');

require('dotenv').config();

const app = express()

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