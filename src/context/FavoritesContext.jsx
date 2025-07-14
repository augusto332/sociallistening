import { createContext, useContext, useState } from "react";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (mention) => {
    setFavorites((prev) => {
      const exists = prev.find((m) => m.url === mention.url);
      if (exists) {
        return prev.filter((m) => m.url !== mention.url);
      }
      return [...prev, mention];
    });
  };

  const isFavorite = (mention) => favorites.some((m) => m.url === mention.url);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
