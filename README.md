# Lista de Leitura - Web Full Stack

Este projeto é uma aplicação Web Full Stack desenvolvida para gerenciar uma lista de leitura.  
Foi criado como parte da disciplina **Desenvolvimento Web Fullstack**, do curso **Análise e Desenvolvimento de Sistemas (ADS)** da **UTFPR**.

## Tecnologias Utilizadas

### Frontend
- React
- Material UI (MUI)

### Backend
- Node.js
- Express

### Banco de Dados
- MongoDB

### Cache
- Redis  
  Utilizado para otimizar operações de leitura.

### Ambiente
- Docker Compose  
  Orquestração de todos os serviços do projeto.

  ## Como Executar o Projeto

### 1. Clonar o repositório

git clone https://github.com/edson-vieira19/Projeto_FullStack

### 2. Rodar o ambiente docker na pasta do projeto

cd Projeto_FullStack

docker compose up -d

### 3. Executar o Script de povoamento (opcional)

cd Backend

npm run seed

### 4. Executar o Backend

npm start

### 5. Executar o FrontEnd

cd ../FrontEnd

npm run dev

### 6 Acessar a Aplicação

Abra o Navegador em http://localhost:5173/


