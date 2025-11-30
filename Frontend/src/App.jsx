import React, { useState } from "react";
import "./App.css";
import { Box } from "@mui/material";
import Header from "./components/Header";
import Footer from "./components/Footer";
//import TesteApi from "./components/TesteApi";
import Inicio from "./components/Inicio";
import BuscarLivro from "./components/BuscarLivro";
import CadastrarLivro from "./components/CadastrarLivro";
import MinhaLista from "./components/MinhaLista";
import Sobre from "./components/Sobre";
import Login from "./components/Login";
import { ListaProvider } from "./contexts/ListaContext";

function App() {
  const [paginaAtual, setPaginaAtual] = useState("inicio");

  const renderPagina = () => {
    switch (paginaAtual) {
      case "inicio":
        return <Inicio onNavigate={setPaginaAtual} />;
      case "buscar":
        return <BuscarLivro onNavigate={setPaginaAtual} />;
      case "lista":
        return <MinhaLista />;
      case "sobre":
        return <Sobre />;
      case "login":
        return <Login onNavigate={setPaginaAtual} />;
      case "cadastrar":
        return <CadastrarLivro onNavigate={setPaginaAtual} />;  

      default:
        return <Inicio onNavigate={setPaginaAtual} />;
    }
  };

  return (

    <ListaProvider>
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Header onNavigate={setPaginaAtual} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {renderPagina()}
      </Box>
      <Footer />
    </Box>
    </ListaProvider>
  );
}

export default App;
