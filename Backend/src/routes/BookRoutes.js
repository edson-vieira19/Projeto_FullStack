const express = require('express');
const Book = require('../models/Book');
const authenticateToken = require('./authMiddleware');
const redisClient = require('../config/redis'); 
const router = express.Router();

const sanitize = (param) => param ? param.replace(/[$;()]/g, "") : param; 

const getCacheKey = (req) => {
    const { page = 1, limit = 10, title = '' } = req.query;
    return `books:page:${page}:limit:${limit}:title:${sanitize(title)}`;
};

//inserir novo livro
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

    await redisClient.del('books:*'); 
    console.log(`Cache invalidado. Livro inserido por ${req.user.username}: ${book.title}`); 

    res.status(201).json(book);

  } catch (error) {
    if (error.name === 'ValidationError') {
        return res.status(400).json({ msg: 'Dados inválidos.', details: error.message });
    }
    res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});


router.get('/books', authenticateToken, async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchTerm = sanitize(req.query.title);
  const skip = (page - 1) * limit;

  const cacheKey = getCacheKey(req);
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    console.log(`Cache Hit: Retornando livros (Pág ${page}) do Redis.`);
    return res.json(JSON.parse(cachedData));
  }

  try {
    const query = {};
    if (searchTerm) {
        query.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { author: { $regex: searchTerm, $options: 'i' } }
        ];
    }
    
    const totalItems = await Book.countDocuments(query);
    const books = await Book.find(query)
                            .skip(skip)
                            .limit(limit)
                            .sort({ _id: -1 });
    
    const responseData = {
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
        data: books
    };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData)); 
    console.log(`Cache Miss: Buscando livros (Pág ${page}) no DB e armazenando no Redis.`);
    console.log(`Busca de livros realizada por ${req.user.username}`); 

    res.json(responseData);
  } catch (error) {
    console.error('ERRO NA BUSCA:', error);
    res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});


router.get('/books/:id', authenticateToken, async (req, res) => {
    try {
        const bookId = sanitize(req.params.id);

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ msg: 'Livro não encontrado.' });
        }

        res.json(book);
    } catch (error) {
        if (error.name === 'CastError') {
             return res.status(400).json({ msg: 'ID de livro inválido.' });
        }
        res.status(500).json({ msg: 'Erro interno do servidor.' });
    }
});


//atualizar livro pelo id, requer token
router.put('/books/:id', authenticateToken, async (req, res) => {
    try {
        const bookId = sanitize(req.params.id);
        const updates = {};
        
        if (req.body.title) updates.title = sanitize(req.body.title);
        if (req.body.author) updates.author = sanitize(req.body.author);
        if (req.body.year) updates.year = req.body.year; // O ano é um número, não precisa de sanitize de string
        if (req.body.thumbnail) updates.thumbnail = sanitize(req.body.thumbnail);

        const updatedBook = await Book.findByIdAndUpdate(
            bookId, 
            { $set: updates }, 
            { new: true, runValidators: true }
        )
        if (!updatedBook) {
            return res.status(404).json({ msg: 'Livro não encontrado para atualização.' });
        }
        
        await redisClient.del('books:*'); 
        console.log(`Cache invalidado. Livro atualizado: ${updatedBook.title}`); 

        res.json(updatedBook);

    } catch (error) {
        if (error.name === 'ValidationError') {
             return res.status(400).json({ msg: 'Dados inválidos para atualização.', details: error.message });
        }
        res.status(500).json({ msg: 'Erro interno do servidor.' });
    }
});

//operação de deletar usando token
router.delete('/books/:id', authenticateToken, async (req, res) => {
    try {
        const bookId = sanitize(req.params.id);

        const deletedBook = await Book.findByIdAndDelete(bookId);

        if (!deletedBook) {
            return res.status(404).json({ msg: 'Livro não encontrado para exclusão.' });
        }
        
        await redisClient.del('books:*'); 
        console.log(`Cache invalidado. Livro excluído: ${deletedBook.title}`); 

        res.status(204).send(); 

    } catch (error) {
        if (error.name === 'CastError') {
             return res.status(400).json({ msg: 'ID de livro inválido.' });
        }
        res.status(500).json({ msg: 'Erro interno do servidor.' });
    }
});


module.exports = router;