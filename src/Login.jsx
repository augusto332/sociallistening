import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message)
    } else {
      navigate("/app/mentions")
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
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
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <Button type="submit" className="w-full">
          Iniciar sesión
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
