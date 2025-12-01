//scrip para povoar o banco com alguns dados iniciais

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Book = require('../models/Book');
const connectDB = require('./db');

const SALT_ROUNDS = 10;

const booksData = [
  {
    "title": "O senhor dos anéis a sociedade do anel",
    "author": "J.R.R. Tolkien",
    "year": 1994,
    "thumbnail": "https://m.media-amazon.com/images/I/81hCVEC0ExL._SY466_.jpg"
  },
  {
    "title": "Harry Potter e a Pedra Filosofal",
    "author": "J.K J.K. Rowling",
    "year": 2000,
    "thumbnail": "https://m.media-amazon.com/images/I/41897yAI4LL._SY445_SX342.jpg"
  },
  {
    "title": "Deus um delírio",
    "author": "Richard Dawkings",
    "year": 2007,
    "thumbnail": "https://m.media-amazon.com/images/I/71bC5EE7ZmL._SY466_.jpg"
  },
  {
    "title": "O universo em uma casca de noz",
    "author": "Stephen Hawking",
    "year": 2001,
    "thumbnail": "https://m.media-amazon.com/images/I/4102kHdwZXL._SX342_SY445.jpg"
  },
  {
    "title": "crime e castigo",
    "author": "Fiódor Dostoiévski",
    "year": 2024,
    "thumbnail": "https://m.media-amazon.com/images/I/41JcuEerjBL._SY445_SX342_ControlCacheEqualizer_.jpg"
  }
];

const usersData = [
    { "username": "admin", "password": "admin123" },
    { "username": "edson", "password": "edson123" },
    { "username": "usuario", "password": "user123" }
];


async function seedDB() {
    try {
        
        await connectDB(); 

        await Book.deleteMany({});
        await User.deleteMany({});
        console.log('--- Coleções Book e User limpas. ---');

        await Book.insertMany(booksData);
        console.log(` ${booksData.length} Livros inseridos com sucesso!`);

        const hashedUsers = await Promise.all(
            usersData.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
                return { username: user.username, password: hashedPassword };
            })
        );
        
        await User.insertMany(hashedUsers);
        console.log(` ${usersData.length} Usuários inseridos com sucesso`);

    } catch (error) {
        console.error('Erro no povoamento do DB:', error);
    } finally {
        await mongoose.disconnect(); 
        console.log('--- Conexão com MongoDB fechada. ---');
        process.exit();
    }
}

seedDB();