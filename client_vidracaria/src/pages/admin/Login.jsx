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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 via-white to-blue-100 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
        {/* LOGO ou NOME DO SISTEMA */}
        <div className="mb-6 text-center">
          <div className="text-4xl font-extrabold text-blue-700">BM - Vidraçaria</div>
          <p className="text-sm text-gray-500 mt-1">Acesso ao painel administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="exemplo@email.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              placeholder="Digite sua senha"
              value={form.senha}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition duration-200 font-semibold"
          >
            Entrar
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} AC Solutions. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default Login;
