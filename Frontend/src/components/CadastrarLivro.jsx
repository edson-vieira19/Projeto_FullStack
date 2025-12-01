import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Paper, 
    Container,
    Alert,
    Snackbar,
    CircularProgress // Para o estado de loading
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CadastrarLivro = ({ onNavigate }) => {

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        year: '',
        thumbnail: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const token = localStorage.getItem('userToken');
        if (!token) {
            setError('Sessão expirada. Faça login novamente.');
            setLoading(false);
            onNavigate('login');
            return;
        }

        try {
           
            const dataToSend = { ...formData, year: parseInt(formData.year) };
            
            if (!dataToSend.title || !dataToSend.author || isNaN(dataToSend.year)) {
                 throw new Error("Preencha todos os campos obrigatórios (Título, Autor e Ano).");
            }
            
            const response = await fetch(`${API_URL}/api/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Autenticação
                },
                body: JSON.stringify(dataToSend),
            });

            setLoading(false);

            if (response.status === 401 || response.status === 403) {
                 localStorage.removeItem('userToken');
                 onNavigate('login');
                 return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Erro desconhecido ao cadastrar o livro.");
            }

            const newBook = await response.json();
            
            setFormData({ title: '', author: '', year: '', thumbnail: '' }); 
            setSnackbarMessage(`Livro "${newBook.title}" cadastrado com sucesso!`);
            setSnackbarOpen(true);

            setTimeout(() => onNavigate('buscar'), 800);

        } catch (err) {
            console.error("Erro no cadastro:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Cadastrar Novo Livro
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    
                    <TextField
                        label="Título do Livro"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Autor"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Ano de Publicação"
                        name="year"
                        type="number"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <TextField
                        label="URL da Capa (Thumbnail)"
                        name="thumbnail"
                        value={formData.thumbnail}
                        onChange={handleChange}
                        fullWidth
                        placeholder="Ex: https://m.media-amazon.com/images/..."
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading}
                        sx={{ mt: 2, py: 1.5 }}
                    >
                        {loading ? 'Cadastrando...' : 'Salvar Livro'}
                    </Button>
                    
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => onNavigate('buscar')}
                    >
                        Voltar para a Busca
                    </Button>

                </Box>
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default CadastrarLivro;