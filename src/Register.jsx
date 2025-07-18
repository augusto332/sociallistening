import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (error) {
      setError(error.message);
    } else {
      setRegistered(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-gray-100">
      <form onSubmit={handleRegister} className="bg-secondary p-8 rounded-lg space-y-4 shadow-md w-80">
        <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>
        <Input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Correo electrónico"
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
        <Input
          placeholder="Confirmar contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {registered && (
          <p className="text-sm text-green-500 text-center">
            Revisa tu correo para confirmar tu cuenta.
          </p>
        )}
        <Button type="submit" className="w-full">
          Registrarse
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-primary hover:underline">
            Inicia sesión
          </a>
        </p>
      </form>
    </div>
  );
}
