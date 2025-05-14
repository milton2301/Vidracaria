import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaSignOutAlt, FaFile, FaCogs, FaTerminal, FaGlassCheers } from 'react-icons/fa';

const AdminMenu = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_nome');
    navigate('/admin/login');
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-100 transition ${
      isActive ? 'bg-blue-200 font-semibold' : ''
    }`;

  return (
    <div className="w-60 bg-white shadow h-screen fixed top-0 left-0 p-4">
      <h2 className="text-xl font-bold text-blue-800 mb-6">Administrativo</h2>

      <nav className="flex flex-col gap-2">
        <NavLink to="/admin/home" className={linkClasses}>
          <FaHome /> Home
        </NavLink>
        <NavLink to="/admin/usuarios" className={linkClasses}>
          <FaUser /> Usuários
        </NavLink>
        <NavLink to="/admin/imagens" className={linkClasses}>
          <FaFile /> Imagens
        </NavLink>
        <NavLink to="/admin/servicos" className={linkClasses}>
          <FaCogs /> Serviços
        </NavLink>
        <NavLink to="/admin/vidros" className={linkClasses}>
          <FaGlassCheers/> Vidros
        </NavLink>
        <NavLink to="/admin/configuracoes" className={linkClasses}>
          <FaTerminal /> Gerais
        </NavLink>
        <button onClick={logout} className="cursor-pointer flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-100 rounded mt-4">
          <FaSignOutAlt /> Sair
        </button>
      </nav>
    </div>
  );
};

export default AdminMenu;
