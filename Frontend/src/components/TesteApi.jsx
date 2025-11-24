import React, { useEffect, useState } from "react";

export default function TesteApi() {
  const [livro, setLivro] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

  useEffect(() => {
    const buscarLivro = async () => {
      try {

        console.log("Usando API KEY:", apiKey);
        
        const resposta = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:harry+potter&key=${apiKey}`
        );
        const dados = await resposta.json();

        const item = dados.items?.[0];
        if (item) {
          setLivro({
            titulo: item.volumeInfo.title,
            autores: item.volumeInfo.authors?.join(", "),
            imagem: item.volumeInfo.imageLinks?.thumbnail,
          });
        }
      } catch (erro) {
        console.error("Erro ao buscar livro:", erro);
      }
    };

    buscarLivro();
  }, [apiKey]);

  if (!livro) return <p>Carregando...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>{livro.titulo}</h2>
      <p>{livro.autores}</p>
      {livro.imagem && <img src={livro.imagem} alt={livro.titulo} />}
    </div>
  );
}
