// src/pages/admin/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login = () => {
  const [form, setForm] = useState({ email: '', senha: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
  
      const data = await res.json();
  
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario_nome', data.nome);
  
        if (data.precisaTrocarSenha) {
          navigate('/admin/trocar-senha'); // redireciona pra tela de troca
        } else {
          Swal.fire({ icon: 'success', title: `Bem-vindo, ${data.nome}`, timer: 1500, showConfirmButton: false });
          navigate('/admin/dashboard');
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Acesso negado', text: data.error || 'Erro ao fazer login' });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Erro de conexão', text: 'Servidor não respondeu' });
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm space-y-4"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700">Login</h2>
        <input
          name="email"
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          name="senha"
          type="password"
          placeholder="Senha"
          value={form.senha}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;
