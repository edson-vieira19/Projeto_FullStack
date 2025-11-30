import React, { useState } from "react";
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
  Button,
  InputAdornment
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';
import SearchIcon from "@mui/icons-material/Search";
import { useLista } from "../contexts/ListaContext";

const BuscarLivro = ({ onNavigate }) => {
  //const [busca, setBusca] = useState("");
  const [opcoes, setOpcoes] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { dispatch } = useLista();

  const isUserLoggedIn = () => {
    return !!localStorage.getItem('userToken');
  };

  const handleBuscar = async (valor) => {

    //setBusca(valor);
    if (valor.length < 3){
      return;
    } 

    try {

      const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

      const resposta = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
          valor
        )}&langRestrict=pt&maxResults=6&key=${apiKey}`
      );

      const dados = await resposta.json();

      if (dados.items) {
        const livros = dados.items.map((item) => ({
          id: item.id,
          titulo: item.volumeInfo.title,
          autores: item.volumeInfo.authors?.join(", ") || "Autor desconhecido",
          ano: item.volumeInfo.publishedDate
            ? item.volumeInfo.publishedDate.slice(0, 4)
            : "N/A",
          capa: item.volumeInfo.imageLinks?.thumbnail || "https://placehold.co/128x180?text=sem+capa",
        }));
        setOpcoes(livros);
        setResultados(livros);
      } else {
        setOpcoes([]);
        setResultados([]);
      }
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    }
  };

  const adicionarLivro = (livro) => {
    dispatch({ type: "ADICIONAR", payload: livro });
  };

  const handleAdicionar = (livro) => {
    adicionarLivro(livro);
    const shortTitle = 
      livro.titulo.length > 30
      ? livro.titulo.slice(0, 30).trim() + "..."
      : livro.titulo;
    setSnackbarMessage(`O Livro "${shortTitle}" foi adicionado à lista!`);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ mt: 8, textAlign: "center", px: 2 }}>
      {isUserLoggedIn() && (
        <Button
            variant="contained"
            color="secondary"
            startIcon={<AssignmentAddIcon />}
            onClick={() => onNavigate('cadastrar')} // Redireciona para a nova página
            sx={{ mb: 4, py: 1.5, fontSize: '1rem' }}
        >
            Cadastrar Novo Livro
        </Button>
      )}
      <Autocomplete
        freeSolo
        options={opcoes}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.titulo
        }
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {option.titulo}
          </li>
        )}
        onInputChange={(e, valor) => handleBuscar(valor)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar livro pelo título"
            variant="outlined"
            /* slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="ícone de busca"
                    edge="end"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }} */
            sx={{
              width: "100%",
              maxWidth: 550,
              mx: "auto",
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 2,
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
          <Grid key={`${livro.id}-${index}`} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              {livro.capa && (
                <CardMedia
                  component="img"
                  image={livro.capa}
                  alt={livro.titulo}
                  sx={{ height: 180, objectFit: "cover" }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
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
