import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './pages/admin/ProtectedRoute';
import TrocarSenha from './pages/admin/TrocarSenha';
import Usuarios from './pages/admin/Usuarios';
import AdminLayout from './components/AdminLayout';
import CadastroImagem from './pages/admin/CadastroImagem';
import CadastroServico from './pages/admin/CadastroServico';
import CadastroConfiguracoes from './pages/admin/CadastroConfiguracoes';


export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Home />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/trocar-senha" element={<TrocarSenha />} />

      <Route path="/admin/*" element={<ProtectedRoute />}>
        <Route path="home" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="usuarios" element={<AdminLayout><Usuarios /></AdminLayout>} />
        <Route path="imagens" element={<AdminLayout><CadastroImagem /></AdminLayout>} />
        <Route path="servicos" element={<AdminLayout><CadastroServico /></AdminLayout>} />
        <Route path="configuracoes" element={<AdminLayout><CadastroConfiguracoes /></AdminLayout>} />
        {/* Rota inválida dentro de /admin */}
        <Route path="*" element={<Navigate to="/admin/home" replace />} />
      </Route>
      {/* Rota coringa: redireciona qualquer outra URL inválida para home */}
    </Routes>
  );
}
