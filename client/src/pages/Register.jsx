import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api.js';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await API.post('/auth/register', { username, password });
      alert('Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate('/');
    } catch {
      alert('Kayıt başarısız! Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Kayıt Ol</h2>

        <div className="space-y-4">
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
            onClick={handleRegister}
          >
            Kayıt Ol
          </button>
        </div>

        <p className="text-sm text-center text-gray-600 mt-6">
          Zaten hesabın var mı?{' '}
          <a href="/" className="text-green-600 hover:underline">
            Giriş Yap
          </a>
        </p>
      </div>
    </div>
  );
}