import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import SocialListeningApp from './App';
import Login from './Login';
import './index.css';
import { FavoritesProvider } from './context/FavoritesContext';
import { supabase } from './lib/supabaseClient';

function Root() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return <Login />;
  }

  return (
    <FavoritesProvider>
      <SocialListeningApp />
    </FavoritesProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
