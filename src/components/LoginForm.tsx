import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Building2 } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular un pequeño delay para mejor UX
    setTimeout(() => {
      if (password === 'zubirigautxori123') {
        onLogin();
      } else {
        setError('Contraseña incorrecta. Inténtalo de nuevo.');
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Building2 className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Zaldiko</h1>
          </div>
          <p className="text-gray-600">Gestión de Pensión y Albergue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="h-4 w-4 inline mr-2" />
              Contraseña de Acceso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Introduce la contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isLoading || !password
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Verificando...</span>
              </div>
            ) : (
              'Acceder al Sistema'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Sistema de gestión hotelera seguro
          </p>
        </div>
      </div>
    </div>
  );
};