// src/components/Footer.jsx
import React from 'react';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white py-6 px-4 text-center">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
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
        <div className="flex items-center gap-3">
          <FaMapMarkerAlt className="text-red-500" />
          <a
            href="https://www.google.com/maps/search/?api=1&query=R.+Dep.+Luiz+G+Sampaio%2C+706+-+Cristal"
            target="_blank"
            style={{ textDecoration: 'none', color: 'inherit' }}
            rel="noopener noreferrer"
            className="hover:underline text-sm text-gray-700"
          >
            R. Dep. Luiz G Sampaio, 758 - Cristal
          </a>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} AC Solutions. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
