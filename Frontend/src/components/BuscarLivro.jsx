import React, { useState, useEffect } from "react"; 
import {
  Box,
  TextField,
  Autocomplete,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Snackbar,
  Alert,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress 
} from "@mui/material";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Pagination from '@mui/material/Pagination';
import { useLista } from "../contexts/ListaContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const LIMIT_PER_PAGE = 6;

const BuscarLivro = ({ onNavigate }) => { 
  
  const [opcoes, setOpcoes] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { dispatch } = useLista();
  const [error, setError] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [editingBook, setEditingBook] = useState(null); 
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', author: '', year: '', thumbnail: '' });

  const isUserLoggedIn = () => {
    return !!localStorage.getItem('userToken');
  };

  const handleBuscar = async (valor = "") => {
    setLoading(true);
    setError(null);
    setResultados([]);
    setTotalPages(1);

    const token = localStorage.getItem('userToken');

    if (!isUserLoggedIn()) {
      setError('necessario login na aplicação');
      onNavigate('login');
      setLoading(false);
      return;
    }

    if (valor.length > 0 && valor.length < 3) {
      setOpcoes([]);
      if (valor.length === 0) handleBuscar(); 
      return; 
    }
    
    const baseQuery = valor.trim() 
    ? `?title=${encodeURIComponent(valor.trim())}&page=1&limit=${LIMIT_PER_PAGE}` 
    : `?page=${currentPage}&limit=${LIMIT_PER_PAGE}`;
    
    try {
      const response = await fetch(`${API_URL}/api/books${baseQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('userToken');
          onNavigate('login');
          return;
      }

      if (!response.ok) {
        throw new Error("Falha ao buscar livros na API local.");
      }

      const data = await response.json();
    
      const booksArray = Array.isArray(data) ? data : (data.data || []);

      setTotalPages(data.totalPages || 1);
      
      if (booksArray.length === 0) {
         setError("Nenhum livro encontrado com o termo de busca.");
      }
      
      const mappedBooks = booksArray.map(book => ({
        id: book._id, 
        titulo: book.title, 
        autores: book.author, 
        ano: book.year,
        thumbnail: book.thumbnail,
        label: `${book.title} (${book.author})`
      }));


      setResultados(mappedBooks);
      setOpcoes(mappedBooks.map(book => book.titulo)); 

    } catch (err) {
      console.error("Erro na busca:", err);
      setError(err.message || "Erro de rede ao buscar livros.");
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm("Tem certeza que deseja excluir este livro?")) {
        return;
    }
    const token = localStorage.getItem('userToken');

    if (!token || !isUserLoggedIn()) {
        setError('Sessão expirada. Faça login novamente.');
        onNavigate('login');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/books/${bookId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 204) {
            setSnackbarMessage("Livro excluído com sucesso.");
            setOpenSnackbar(true);
            setRefreshCounter(prev => prev + 1);
        } else if (response.status === 404) {
             setError("Livro não encontrado para exclusão.");
        } else if (response.status === 401 || response.status === 403) {
            setError('Não autorizado. Faça login novamente.');
            localStorage.removeItem('userToken');
            onNavigate('login');
        } else {
            const errorData = await response.json();
            setError(errorData.msg || "Erro desconhecido ao excluir o livro.");
        }

    } catch (err) {
        console.error("Erro na exclusão:", err);
        setError(err.message || "Erro de rede ao tentar excluir.");
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    setError(null);
    
    const token = localStorage.getItem('userToken');
    if (!token || !isUserLoggedIn()) {
        setError('Sessão expirada. Faça login novamente.');
        onNavigate('login');
        return;
    }

    try {
        const dataToSend = { 
            ...editFormData, 
            year: parseInt(editFormData.year),
        };
        
        if (!dataToSend.title || !dataToSend.author || isNaN(dataToSend.year)) {
             throw new Error("Preencha Título, Autor e Ano válidos.");
        }
        
        const response = await fetch(`${API_URL}/api/books/${editFormData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(dataToSend),
        });

        if (response.status === 401 || response.status === 403) {
             localStorage.removeItem('userToken');
             onNavigate('login');
             return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || "Erro desconhecido ao atualizar o livro.");
        }

        handleCloseEditModal(); 
        setSnackbarMessage(`Livro "${editFormData.title}" atualizado com sucesso!`);
        setOpenSnackbar(true);
        setRefreshCounter(prev => prev + 1);

    } catch (err) {
        console.error("Erro na atualização:", err);
        setError(err.message);
    }
  };

  const handlePageChanges = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    if(isUserLoggedIn()){
      handleBuscar(); 
    } else {
         setError("Você precisa estar logado para carregar e buscar livros.");
    }
    
  }, [currentPage,refreshCounter]); 


  const handleAdicionar = (livro) => {

    console.log("dentro da funcao handleAdicionar")
    console.log(livro);

    dispatch({ type: "ADICIONAR", payload: livro });

    const shortTitle = 
      livro.titulo.length > 30
      ? livro.titulo.slice(0, 30).trim() + "..."
      : livro.titulo;
    setSnackbarMessage(`O Livro "${shortTitle}" foi adicionado à lista!`);
    setOpenSnackbar(true);
  };

  const handleOpenEditModal = (livro) => {
    setEditingBook(livro);
    setEditFormData({ 
      id: livro.id,
      title: livro.titulo, 
      author: livro.autores, 
      year: livro.ano, 
      thumbnail: livro.thumbnail 
    });
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingBook(null);
    setError(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };
  
  const handleCadastroClick = () => {
    onNavigate('cadastrar'); 
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  return (
    <Box sx={{ mt: 8, textAlign: "center", px: 2 }}>
      {isUserLoggedIn() && (
        <Button
            variant="contained"
            color="secondary"
            startIcon={<AssignmentAddIcon />}
            onClick={handleCadastroClick}
            sx={{ mb: 4, py: 1.5, fontSize: '1rem' }}
        >
            Cadastrar Novo Livro
        </Button>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            {error}
        </Alert>
      )}
      <Autocomplete
        options={opcoes} 
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label 
        }
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {option.titulo}
          </li>
        )}
        onInputChange={(e, valor) => {
            handleBuscar(valor);
        }}
        onChange={(event, newValue) => {
          if (newValue) {
            const livroSelecionado = resultados.find(l => l.label === newValue);
            setResultados(livroSelecionado ? [livroSelecionado] : []);
          } else {
            handleBuscar();
          }
        }}
        
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar livro pelo título"
            variant="outlined"
            sx={{
              width: "100%",
              maxWidth: 550,
              mx: "auto",
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 2,
              mb: 4, 
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
      
      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ mt: 4, mb: 6, maxWidth: 900, mx: "auto" }}
      >
        {resultados.map((livro, index) => (
          <Grid key={`${livro.id}-${index}`} xs={12} sm={6} md={4}> 
            <Card
              sx={{ display: "flex", flexDirection: "column", height: "100%", width: 250, boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                }, 
              }}
            >
              {livro.thumbnail && (
                <CardMedia
                  component="img"
                  image={livro.thumbnail}
                  alt={livro.titulo}
                  sx={{ height: 180, objectFit: "cover" }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold"
                sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3, // Limita o título a 3 linhas
                    WebkitBoxOrient: 'vertical',
                    minHeight: '4.5em' // Altura mínima para 3 linhas de texto
                  }}
                  >
                  {livro.titulo}
                </Typography>
                <Typography variant="body2">{livro.autores}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {livro.ano}
                </Typography>
              </CardContent>
              
              <Box sx={{ textAlign: "right", px: 1, pb: 1, pt: 0 }}>
                <Box>
                    <Tooltip title="Editar Livro">
                        <IconButton
                            onClick={() => handleOpenEditModal(livro)}
                            color="info"
                            size="small"
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Excluir Livro">
                        <IconButton
                            onClick={() => handleDelete(livro.id)} 
                            color="error"
                            size="small"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Tooltip title="Adicionar à lista de leitura">
                  <IconButton
                    onClick={() => handleAdicionar(livro)}
                    color= "primary"
                    sx={{pt: 0 }}
                  >
                    <PlaylistAddIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={handlePageChange} 
            color="primary"
            size="large"
          />
        </Box>
      )}
      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogTitle>Editar Livro: {editingBook?.titulo}</DialogTitle>
        <Box component="form" onSubmit={handleUpdateBook}>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
                label="Título do Livro"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                required
                fullWidth
                margin="dense"
            />
            <TextField
                label="Autor"
                name="author"
                value={editFormData.author}
                onChange={handleEditChange}
                required
                fullWidth
                margin="dense"
            />
            <TextField
                label="Ano de Publicação"
                name="year"
                type="number"
                value={editFormData.year}
                onChange={handleEditChange}
                required
                fullWidth
                margin="dense"
            />
            <TextField
                label="URL da Capa (Thumbnail)"
                name="thumbnail"
                value={editFormData.thumbnail}
                onChange={handleEditChange}
                fullWidth
                margin="dense"
                placeholder="Ex: https://m.media-amazon.com/images/..."
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseEditModal} color="secondary">
                Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
                Salvar Alterações
            </Button>
        </DialogActions>
        </Box>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BuscarLivro;

