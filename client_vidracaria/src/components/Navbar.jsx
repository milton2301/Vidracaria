// src/components/Navbar.jsx
import React from 'react';

const Navbar = () => {
  return (
    <header className="fixed w-full bg-white shadow z-50">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-700">BM - Vidraçaria</div>
        <ul className="flex gap-6 text-sm font-medium">
          <li><a href="#hero" className="hover:text-blue-700">Início</a></li>
          <li><a href="#sobre" className="hover:text-blue-700">Sobre</a></li>
          <li><a href="#servicos" className="hover:text-blue-700">Serviços</a></li>
          <li><a href="#galeria" className="hover:text-blue-700">Galeria</a></li>
          <li><a href="#contato" className="hover:text-blue-700">Contato</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
