const express = require('express');
const Book = require('../models/Book');
const authenticateToken = require('./authMiddleware');
const redisClient = require('../config/redis'); 
const router = express.Router();
const logger = require('../config/logger');

const getCacheKey = (req) => {
    const { page = 1, limit = 10, title = '' } = req.query;
    return `books:page:${page}:limit:${limit}:title:${title}`;
};

const deleteKeysByPattern = async (pattern) => {
    let cursor = '0';
    logger.info(` Tentativa de invalidar cache com o padrão: ${pattern}`);
    
    try{
    do {
      
        const resultadoScan = await redisClient.scan(cursor, {
          MATCH: pattern,
          COUNT: 200,
        });

        //console.log('SCAN result type:', typeof resultadoScan, resultadoScan);

        const { cursor: nextCursor, keys } = resultadoScan;

        cursor = nextCursor;

        //console.log(` SCAN Concluído. Próximo Cursor: ${cursor}. Chaves Encontradas: ${keys.length}`);

        if (keys.length > 0) {
            logger.info(`[REDIS] Apagando ${keys.length} chaves que correspondem a ${pattern}.`);
            const deletedCount = await redisClient.del(...keys); // Spread obrigatório!
            logger.info(`Chaves deletadas com sucesso: ${deletedCount}`);
        }

    } while (cursor !== '0');

    //console.log(`Invalidação completa. Total de chaves apagadas: ${totalKeysDeleted}`);
    } catch (error) {
        // 5. Log em caso de erro de conexão ou comando
        logger.error("[REDIS ERRO]  Falha na função deleteKeysByPattern:", error);
    }
};

router.post('/books', authenticateToken, async (req, res) => {
  try {
    const { title, author, year, thumbnail } = req.body;

    if (!title || !author || !year) {
        return res.status(400).json({ msg: 'Título, autor e ano são obrigatórios.' });
    }

    const newBook = new Book({
      title: title,
      author: author,
      year: year,
      thumbnail: thumbnail
    });

    const book = await newBook.save();
    await deleteKeysByPattern('books:*');
    logger.info(`Cache invalidado. Livro inserido por ${req.user.username}: ${book.title}`); 

    res.status(201).json(book);

  } catch (error) {
    if (error.name === 'ValidationError') {
        return res.status(400).json({ msg: 'Dados inválidos.', details: error.message });
    }
    return res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});

router.get('/books', authenticateToken, async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchTerm = req.query.title;
  const skip = (page - 1) * limit;

  const cacheKey = getCacheKey(req);
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    console.info(`Cache Hit: Retornando livros (Pág ${cacheKey}) do Redis.`);
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
    logger.info(`Cache Miss: Buscando livros (Pág ${page}) no DB e armazenando no Redis.`);
    logger.info(`Busca de livros realizada por ${req.user.username}`); 

    res.json(responseData);
  } catch (error) {
    logger.error('ERRO NA BUSCA:', error);
    res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});


router.get('/books/:id', authenticateToken, async (req, res) => {
    try {
        const bookId = req.params.id;

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
        const bookId = req.params.id;
        const updates = {};

        console.log(req.body);
        
        if (req.body.title) updates.title = req.body.title;
        if (req.body.author) updates.author = req.body.author;
        if (req.body.year) updates.year = req.body.year;
        if (req.body.thumbnail) updates.thumbnail = req.body.thumbnail;

        const updatedBook = await Book.findByIdAndUpdate(
            bookId, 
            { $set: updates }, 
            { new: true, runValidators: true }
        )
        if (!updatedBook) {
            return res.status(404).json({ msg: 'Livro não encontrado para atualização.' });
        }
        
        await deleteKeysByPattern('books:*');
        logger.info(`Cache invalidado. Livro atualizado: ${updatedBook.title}`); 

        res.json(updatedBook);

    } catch (error) {

        logger.error("ERRO CRÍTICO NO CADASTRO DE LIVRO:", error);

        if (error.name === 'ValidationError') {
             return res.status(400).json({ msg: 'Dados inválidos para atualização.', details: error.message });
        }
        res.status(500).json({ msg: 'Erro interno do servidor.' });
    }
});

//operação de deletar usando token
router.delete('/books/:id', authenticateToken, async (req, res) => {
    try {
        const bookId = req.params.id;

        const deletedBook = await Book.findByIdAndDelete(bookId);

        if (!deletedBook) {
            return res.status(404).json({ msg: 'Livro não encontrado para exclusão.' });
        }
        
        await deleteKeysByPattern('books:*');  
        logger.info(`Cache invalidado. Livro excluído: ${deletedBook.title}`); 

        res.status(204).send(); 

    } catch (error) {

        logger.error("ERRO AO EXCLUIR LIVRO:", error);
        /* if (error.name === 'CastError') {
             return res.status(400).json({ msg: 'ID de livro inválido.' });
        } */
       return res.status(500).json({ msg: 'Erro interno do servidor.', details: error.message });
        
    }
});


module.exports = router;