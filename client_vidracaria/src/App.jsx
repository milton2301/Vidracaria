import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './pages/admin/ProtectedRoute';
import CadastroUsuario from './pages/admin/CadastroUsuario';
import TrocarSenha from './pages/admin/TrocarSenha';
import Usuarios from './pages/admin/Usuarios';
import AdminLayout from './components/AdminLayout';

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Home/>} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/trocar-senha" element={<TrocarSenha />} />

      <Route path="/admin/*" element={<ProtectedRoute />}>
        <Route path="dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="usuarios" element={<AdminLayout><Usuarios /></AdminLayout>} />
        <Route path="cadastrar" element={<AdminLayout><CadastroUsuario /></AdminLayout>} />
      </Route>
      {/* Rota coringa: redireciona qualquer outra URL inválida para home */}
    </Routes>
  );
}
