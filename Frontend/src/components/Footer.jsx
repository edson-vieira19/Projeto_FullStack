import React from "react";
import { Box, Typography, Link } from "@mui/material";

function Footer(){


    return(<Box
      component="footer"
      sx={{
        backgroundColor: "#1976d2",
        color: "white",
        textAlign: "center",
        py: 2,
        mt: "auto",
      }}
    >
      <Typography variant="body1">
        © {new Date().getFullYear()} Lista de Leitura - Todos direitos reservados.
      </Typography>
    </Box>
    );
}





export default Footer