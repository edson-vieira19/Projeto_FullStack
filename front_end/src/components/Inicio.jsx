import React from "react";

import { Box, Typography, Button, Container, Paper } from "@mui/material";

function Inicio({ onNavigate }) {
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
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: 6,
            borderRadius: 4,
            textAlign: "center",
            backgroundColor: "#fafafa",
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: "'Merriweather', serif",
              fontWeight: 400,
              letterSpacing: 2,
            }}
          >
            Bem-vindo à sua Lista de Leitura
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, mt: 2, lineHeight: 1.6 }}
          >
            Organize seus livros favoritos, descubra novas leituras e mantenha
            tudo em um só lugar. Clique abaixo para começar!
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              fontSize: "1.1rem",
              fontWeight: "bold",
            }}
            onClick={() => onNavigate("buscar")}
          >
            Iniciar
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default Inicio;
