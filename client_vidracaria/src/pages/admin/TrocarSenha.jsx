import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const TrocarSenha = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ senhaNova: '', confirmarSenha: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTrocar = async (e) => {
    e.preventDefault();

    if (form.senhaNova !== form.confirmarSenha) {
        return Swal.fire('Erro', 'As senhas não coincidem.', 'error');
      }
      
      if (form.senhaNova.length < 6) {
        return Swal.fire('Erro', 'A senha deve ter pelo menos 6 caracteres.', 'error');
      }
      
      if (!/[A-Za-z]/.test(form.senhaNova) || !/\d/.test(form.senhaNova)) {
        return Swal.fire('Erro', 'A senha deve conter pelo menos uma letra e um número.', 'error');
      }

    const token = localStorage.getItem('token');
    if (!token) return Swal.fire('Erro', 'Usuário não autenticado.', 'error');

    try {
      const res = await fetch('http://localhost:4000/trocar-senha', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senhaNova: form.senhaNova }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire('Sucesso', 'Senha atualizada com sucesso!', 'success');
        navigate('/admin/dashboard');
      } else {
        Swal.fire('Erro', data.error || 'Erro ao atualizar senha.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Erro', 'Erro de conexão com o servidor.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleTrocar}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm space-y-4"
      >
        <h2 className="text-xl font-bold text-blue-700 text-center">Alterar Senha</h2>
        <input
          type="password"
          name="senhaNova"
          placeholder="Nova senha"
          required
          value={form.senhaNova}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="password"
          name="confirmarSenha"
          placeholder="Confirmar nova senha"
          required
          value={form.confirmarSenha}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
        >
          Salvar nova senha
        </button>
      </form>
    </div>
  );
};

export default TrocarSenha;
