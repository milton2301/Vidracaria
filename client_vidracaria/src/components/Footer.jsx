// src/components/Footer.jsx
import React from 'react';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white py-6 px-4 text-center">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm">&copy; {new Date().getFullYear()} Vidraçaria. Todos os direitos reservados.</p>
        <div className="flex gap-4 justify-center">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebookF className="hover:text-blue-300 transition text-lg" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram className="hover:text-pink-300 transition text-lg" />
          </a>
          <a href="https://wa.me/5511987654321" target="_blank" rel="noreferrer">
            <FaWhatsapp className="hover:text-green-300 transition text-lg" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
