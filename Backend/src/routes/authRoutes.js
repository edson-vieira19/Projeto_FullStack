const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.JWT_SECRET;

const SALT_ROUNDS = 10

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ msg: 'Usuário e senha são obrigatórios.' }); 
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`Tentativa de login falhou para o usuário: ${username}`);
      return res.status(401).json({ msg: 'Credenciais inválidas.' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log(`Tentativa de login falhou para o usuário: ${username}`);
      return res.status(401).json({ msg: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_KEY,
      { expiresIn: '1h' } 
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ msg: 'Erro interno do servidor.' });
  }
});

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ msg: 'Usuário e senha são obrigatórios.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ 
            msg: 'Usuário cadastrado com sucesso.', 
            user: { username: newUser.username, id: newUser._id } 
        });

    } catch (error) {
        if (error.code === 11000) { 
            return res.status(409).json({ msg: 'Nome de usuário já existe.' });
        }
        res.status(500).json({ msg: 'Erro interno do servidor.',
          details: process.env.NODE_ENV !== 'production' ? error.message : undefined
         });
        
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find()//.select('-password'); 
        res.json(users);
    } catch (error) {
        console.error('ERRO AO BUSCAR USUÁRIOS:', error);
        res.status(500).json({ msg: 'Erro interno ao buscar usuários.' });
    }
});




module.exports = router;