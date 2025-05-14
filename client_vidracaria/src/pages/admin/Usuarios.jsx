import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import { FaBan, FaUnlock, FaToggleOn, FaToggleOff, FaPlus, FaSave } from 'react-icons/fa';

Modal.setAppElement('#root');

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '' });

  // PAGINAÇÃO: início
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reseta página ao alterar o filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [filtro]);
  // PAGINAÇÃO: fim

  const carregarUsuarios = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [campo]: novoValor }),
      });

      if (res.ok) {
        Swal.fire(
          'Sucesso',
          `Usuário ${campo === 'ativo' ? (novoValor ? 'ativado' : 'desativado') : (novoValor ? 'bloqueado' : 'desbloqueado')} com sucesso!`,
          'success'
        );
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

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cadastrarUsuario = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, {
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
        setModalAberto(false);
        carregarUsuarios();
      } else {
        Swal.fire('Erro', data.error || 'Erro ao cadastrar.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Erro', 'Erro de conexão com o servidor.', 'error');
    }
  };

  // PAGINAÇÃO: filtro e slice
  const usuariosFiltrados = usuarios.filter((u) => {
    const termo = filtro.toLowerCase();
    return (
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo)
    );
  });

  const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);
  const paginatedUsuarios = usuariosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // PAGINAÇÃO: fim

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-800">Gerenciar Usuários</h2>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow inline-flex items-center"
        >
          <FaPlus className="mr-2" /> Novo Usuário
        </button>
      </div>

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
              <th className="py-2 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsuarios.map((user) => (
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
                <td className="py-2 px-4 space-x-2 flex flex-wrap justify-center">
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

        {/* PAGINAÇÃO: controles */}
        <div className="mt-4 flex justify-end items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded border ${
              currentPage === 1
                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                : 'text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            ‹ Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded border ${
              currentPage === totalPages
                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                : 'text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            Próxima ›
          </button>
        </div>
        {/* PAGINAÇÃO: fim */}
      </div>

      {/* Modal de cadastro */}
      <Modal
        isOpen={modalAberto}
        onRequestClose={() => setModalAberto(false)}
        className="w-full max-w-2xl h-[50vh] mx-auto mt-10 bg-white rounded-lg shadow-lg p-8 overflow-y-auto outline-none"
        overlayClassName="fixed inset-0 bg-blue-200 bg-opacity-60 backdrop-blur-sm flex justify-center items-start"
      >
        <h2 className="text-xl font-bold mb-4 text-blue-700">Novo Usuário</h2>
        <form onSubmit={cadastrarUsuario} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              name="nome"
              required
              value={form.nome}
              onChange={handleInput}
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
              onChange={handleInput}
              placeholder="email@exemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 flex items-center text-white font-semibold px-5 py-2 rounded hover:bg-blue-700"
            >
              <FaSave className='mr-2'/> Cadastrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Usuarios;