'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      console.log('Making login request to:', `${API_URL}/login`);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erreur de connexion');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to homepage
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-500">LMF Services</h1>
      </div>

      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center text-gray-900">Connexion</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>

          <div>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700">
              Mot de passe oublié ?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}