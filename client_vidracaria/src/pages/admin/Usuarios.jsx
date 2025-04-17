import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaBan, FaUnlock, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');

  const carregarUsuarios = async () => {
    try {
      const res = await fetch('http://localhost:4000/usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      Swal.fire('Erro', 'Não foi possível carregar os usuários', 'error');
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const atualizarStatus = async (id, campo, valorAtual) => {
    const novoValor = !valorAtual;

    try {
      const res = await fetch(`http://localhost:4000/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [campo]: novoValor }),
      });

      if (res.ok) {
        Swal.fire('Sucesso', `Usuário ${campo === 'ativo' ? (novoValor ? 'ativado' : 'desativado') : (novoValor ? 'bloqueado' : 'desbloqueado')} com sucesso!`, 'success');
        carregarUsuarios();
      } else {
        const data = await res.json();
        Swal.fire('Erro', data.error || 'Erro ao atualizar usuário.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Erro', 'Erro ao atualizar usuário', 'error');
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const termo = filtro.toLowerCase();
    return (
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Gerenciar Usuários</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filtrar por nome ou e-mail..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border rounded shadow-sm"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-4">Nome</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{user.nome}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${user.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.ativo ? 'Ativo' : 'Desativado'}
                  </span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${user.bloqueado ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                    {user.bloqueado ? 'Bloqueado' : 'Liberado'}
                  </span>
                </td>
                <td className="py-2 px-4 space-x-2 flex flex-wrap">
                  <button
                    onClick={() => atualizarStatus(user.id, 'ativo', user.ativo)}
                    className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded ${user.ativo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                  >
                    {user.ativo ? <FaToggleOff /> : <FaToggleOn />}
                    {user.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => atualizarStatus(user.id, 'bloqueado', user.bloqueado)}
                    className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded ${user.bloqueado ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                  >
                    {user.bloqueado ? <FaUnlock /> : <FaBan />}
                    {user.bloqueado ? 'Desbloquear' : 'Bloquear'}
                  </button>
                </td>
              </tr>
            ))}
            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-6">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;
