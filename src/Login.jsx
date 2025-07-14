import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Error signing in", error);
      }
    } catch (err) {
      console.error("Error signing in", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-gray-100">
      <form onSubmit={handleLogin} className="bg-secondary p-8 rounded-lg space-y-4 shadow-md w-80">
        <h1 className="text-2xl font-bold text-center">Iniciar sesión</h1>
        <Input
          placeholder="Usuario"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Iniciar sesión
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <a href="#" className="text-primary hover:underline">
            Regístrate
          </a>
        </p>
      </form>
    </div>
  );
}
