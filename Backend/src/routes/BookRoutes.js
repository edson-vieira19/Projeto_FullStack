const express = require('express');
const Book = require('../models/Book');
const authenticateToken = require('./authMiddleware');
const redisClient = require('../config/redis'); 
const router = express.Router();

const sanitize = (param) => param ? param.replace(/[$;()]/g, "") : param; 

router.post('/books', authenticateToken, async (req, res) => {
  try {
    const { title, author, year, thumbnail } = req.body;

    if (!title || !author || !year) {
        return res.status(400).json({ msg: 'Título, autor e ano são obrigatórios.' });
    }

    const newBook = new Book({
      title: sanitize(title),
      author: sanitize(author),
      year: year,
      thumbnail: sanitize(thumbnail)
    });

    const book = await newBook.save();

    console.log(`Livro inserido por ${req.user.username}: ${book.title}`); 

    await redisClient.del('all_books'); 

    res.status(201).json(book);

  } catch (error) {
    if (error.name === 'ValidationError') {
        return res.status(400).json({ msg: 'Dados inválidos.', details: error.message });
    }
    res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});

router.get('/books', authenticateToken, async (req, res) => {
  const cacheKey = 'all_books';
  const cachedBooks = await redisClient.get(cacheKey);

  if (cachedBooks) {
    console.log('Cache Hit: Retornando livros do Redis.');
    return res.json(JSON.parse(cachedBooks));
  }

  try {
    const books = await Book.find({});

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(books)); 
    console.log('Cache Miss: Buscando livros no DB e armazenando no Redis.');

    console.log(`Busca de livros realizada por ${req.user.username}`); 

    res.json(books);
  } catch (error) {
    res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});

module.exports = router;