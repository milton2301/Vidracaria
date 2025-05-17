import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const ProtectedRoute = () => {
  const [validado, setValidado] = useState(null); // null = carregando, true = ok, false = inválido

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setValidado(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const agora = Date.now() / 1000;
      
      if (decoded.exp < agora) {
        Swal.fire({
          icon: 'warning',
          title: 'Sessão expirada',
          text: 'Por favor, faça login novamente.',
          timer: 2500,
          showConfirmButton: false,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('usuario_nome');
        setValidado(false);
      } else {
        setValidado(true);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Token inválido',
        text: 'Por favor, faça login novamente.',
        timer: 2500,
        showConfirmButton: false,
      });
      localStorage.removeItem('token');
      localStorage.removeItem('usuario_nome');
      setValidado(false);
    }
  }, []);

  if (validado === null) return null; // ou um loading spinner

  return validado ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;
