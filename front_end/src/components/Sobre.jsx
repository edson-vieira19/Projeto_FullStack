import { Box, Typography, Container, Paper } from "@mui/material";

export default function Sobre() {

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
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: "'Merriweather', serif",
              fontWeight: 300,
              letterSpacing: 2,
            }}
          >
            Lista de Leitura
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, mt: 2, lineHeight: 1.6 }}
          >
            Aplicação React simples para gerenciar uma lista de livros.
             Este projeto foi feito como conteudo avalitivo da disciplina de Desenvolvimento Web Backend
              do curso de Analise e Desenvolvimento de Sistemas da Univerisdade Tecnologica Federal do Paraná
               (UTFPR) Permite buscar livros usando a API do Google Livros,
                adicionar à lista de leitura, editar, excluir e marcar como lidos.
          </Typography>
        </Paper>
      </Container>
    </Box>


    
  )
}
