import React, { useState } from 'react';
import Swal from 'sweetalert2';

const CadastroUsuario = () => {
  const [form, setForm] = useState({
    nome: '',
    email: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:4000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Usuário cadastrado!',
          text: 'A senha padrão foi enviada por e-mail.',
          confirmButtonColor: '#2563eb'
        });
        setForm({ nome: '', email: '' });
      } else {
        Swal.fire('Erro', data.error || 'Erro ao cadastrar.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Erro', 'Erro de conexão com o servidor.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-10">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Novo Usuário</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input
            type="text"
            name="nome"
            required
            value={form.nome}
            onChange={handleChange}
            placeholder="Nome completo"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="email@exemplo.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
};

export default CadastroUsuario;
