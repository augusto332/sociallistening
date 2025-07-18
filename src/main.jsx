import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import SocialListeningApp from './App';
import Login from './Login';
import Register from './Register';
import './index.css';
import { FavoritesProvider } from './context/FavoritesContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function Root() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <FavoritesProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={<Login onLogin={() => setLoggedIn(true)} />}
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={
              loggedIn ? (
                <SocialListeningApp onLogout={() => setLoggedIn(false)} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="*"
            element={<Navigate to={loggedIn ? "/home" : "/login"} replace />}
          />
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
