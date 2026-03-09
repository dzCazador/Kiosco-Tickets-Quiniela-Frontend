import { useState } from 'react';

export type UserRole = 'kiosco' | 'agencia';

type LoginProps = {
  onLogin: (role: UserRole) => void;
};

const credentials: Record<string, { password: string; role: UserRole }> = {
  kiosco: { password: 'kiosco123', role: 'kiosco' },
  agencia: { password: 'agencia321', role: 'agencia' },
};

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('kiosco');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const user = credentials[username];

    if (!user || user.password !== password) {
      setError('Usuario o clave incorrecta');
      return;
    }

    setError('');
    onLogin(user.role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Usuario</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="kiosco o agencia"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Clave</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="********"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500">
          <p className="font-semibold">Credenciales válidas:</p>
          <p>kiosco / kiosco123 (acceso total)</p>
          <p>agencia / agencia321 (solo reportes)</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
