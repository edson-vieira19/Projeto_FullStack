import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import { useLista } from "../contexts/ListaContext";

const MinhaLista = () => {
  const { state, dispatch } = useLista();

  console.log("Estado da Lista de Leitura:", state.livros);

  return (
    <Box sx={{ mt: 6, px: 2, maxWidth: 700, mx: "auto" }}>
      <Typography variant="h5" mb={2}>
        Minha Lista de Leitura:
      </Typography>

      <List>
        {state.livros.map((livro) => (
          <ListItem
            key={livro.id}
            secondaryAction={
              <>
                <Tooltip title="Marcar como lido">
                  <IconButton onClick={() => dispatch({ type: "MARCAR_LIDO", payload: livro.id })}>
                    <DoneIcon color={livro.lido ? "success" : "disabled"} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remover da lista">
                  <IconButton onClick={() => dispatch({ type: "REMOVER", payload: livro.id })}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            }
          >
            <ListItemText
              primary={livro.titulo}
              secondary={`${livro.autores} (${livro.ano})`}
              sx={{
                textDecoration: livro.lido ? "line-through" : "none",
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default MinhaLista;
