// src/components/Login.jsx

import React, { useState } from "react";
import { 
    Box, 
    Typography, 
    Button, 
    Container, 
    Paper, 
    TextField,
    Alert,
    CircularProgress
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

const API_URL = 'http://localhost:3000/api';

function Login({ onNavigate }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', severity: '' });

    const handleSubmit = async (event) => {
        event.preventDefault(); 
        setMessage({ text: '', severity: '' });

        if (!username || !password) {
            setMessage({ text: 'Usuário e senha são obrigatórios.', severity: 'error' });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                
                const token = data.token;
                
                localStorage.setItem('userToken', token); 
                
                setMessage({ text: 'Login realizado com sucesso! Redirecionando...', severity: 'success' });
                
                setTimeout(() => onNavigate('buscar'), 1500); 

            } else {
                setMessage({ text: data.msg || 'Erro ao realizar login.', severity: 'error' });
                console.error('Erro de Login:', data.msg);
            }

        } catch (error) {
            setMessage({ 
                text: 'Não foi possível conectar ao servidor.', 
                severity: 'error' 
            });
            console.error('Erro de Rede:', error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "80vh",
                background: "linear-gradient(135deg, #e3f2fd, #ffffff)",
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={4}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        textAlign: "center",
                        backgroundColor: "#fafafa",
                        width: '100%'
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontFamily: "'Merriweather', serif",
                            fontWeight: 400,
                            letterSpacing: 1,
                            mb: 3
                        }}
                    >
                        Login
                    </Typography>

                    {message.text && (
                        <Alert severity={message.severity} sx={{ mb: 2 }}>
                            {message.text}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Nome de Usuário"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Senha"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Use o usuário "admin" e senha "admin123" para testar.
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}

export default Login;