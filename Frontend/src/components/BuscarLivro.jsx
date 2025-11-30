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
} from "@mui/material";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';
import SearchIcon from "@mui/icons-material/Search";
import { useLista } from "../contexts/ListaContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const BuscarLivro = ({ onNavigate }) => { 
  
  const [opcoes, setOpcoes] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { dispatch } = useLista();
  const [error, setError] = useState(null); 
  
  const isUserLoggedIn = () => {
    return !!localStorage.getItem('userToken');
  };

  const handleBuscar = async (valor = "") => {
    setError(null);
    const token = localStorage.getItem('userToken');

    if (!token) {
        setError("Você precisa estar logado para carregar e buscar livros.");
        setResultados([]); 
        return;
    }

    if (valor.length > 0 && valor.length < 3) {
      setOpcoes([]);
      if (valor.length === 0) handleBuscar(); 
      return; 
    }
    
    const query = valor.trim() ? `?title=${encodeURIComponent(valor.trim())}` : '';
    
    try {
      const response = await fetch(`${API_URL}/api/books${query}`, {
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
      setOpcoes(mappedBooks.map(book => book.label)); 

    } catch (err) {
      console.error("Erro na busca de livros:", err);
      setError("Erro ao carregar os livros. Verifique se o Back-end está rodando.");
      setResultados([]); 
      setOpcoes([]);
    }
  };

  useEffect(() => {
    if(isUserLoggedIn()){
      handleBuscar(); 
    } else {
         setError("Você precisa estar logado para carregar e buscar livros.");
    }
    
  }, []); 


  const handleAdicionar = (livro) => {
    dispatch({ type: "ADICIONAR_LIVRO", payload: livro });
    const shortTitle = 
      livro.titulo.length > 30
      ? livro.titulo.slice(0, 30).trim() + "..."
      : livro.titulo;
    setSnackbarMessage(`O Livro "${shortTitle}" foi adicionado à lista!`);
    setOpenSnackbar(true);
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
          <Grid key={`${livro.id}-${index}`} item xs={12} sm={6} md={4}> 
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