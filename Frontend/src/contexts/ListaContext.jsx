import React, { createContext, useReducer, useContext } from "react";

const initialState = {
  livros: [],
};

const listaReducer = (state, action) => {
  switch (action.type) {
    case "ADICIONAR":
     
      if (state.livros.some((livro) => livro.id === action.payload.id)) return state;
      return { ...state, livros: [...state.livros, action.payload] };

    case "REMOVER":
      return {
        ...state,
        livros: state.livros.filter((livro) => livro.id !== action.payload),
      };

    case "MARCAR_LIDO":
      return {
        ...state,
        livros: state.livros.map((livro) =>
          livro.id === action.payload ? { ...livro, lido: !livro.lido } : livro
        ),
      };

    default:
      return state;
  }
};

const ListaContext = createContext();

export const ListaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(listaReducer, initialState);

  return (
    <ListaContext.Provider value={{ state, dispatch }}>
      {children}
    </ListaContext.Provider>
  );
};

export const useLista = () => useContext(ListaContext);

