import React, { useEffect, useState } from 'react';
import {
  FaHome,
  FaInfoCircle,
  FaTools,
  FaImages
} from 'react-icons/fa';

const Navbar = () => {
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    const buscarLogo = async () => {
      try {
        const res = await fetch(`${base}/imagens`);
        const data = await res.json();
        const logoHeader = data.find(img => img.tipo === 'Logo Header');
        if (logoHeader) {
          setLogo({
            url: `${base}/uploads/${logoHeader.caminho}`,
            descricao: logoHeader.descricao
          });
        }
      } catch (err) {
        console.error('Erro ao carregar logo:', err);
      }
    };

    buscarLogo();
  }, []);

  return (
    <header className="fixed w-full bg-white shadow z-50">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {logo ? (
            <>
              <img src={logo.url} alt="Logo" className="h-10 w-auto object-contain" />
              <span className="text-xl font-bold text-blue-700 whitespace-nowrap">
                {logo.descricao}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-blue-700">BM - Vidraçaria</span>
          )}
        </div>

        <ul className="flex gap-6 text-sm font-medium items-center">
          <li className="flex items-center gap-1">
            <FaHome /> <a href="#hero" className="hover:text-blue-700">Início</a>
          </li>
          <li className="flex items-center gap-1">
            <FaInfoCircle /> <a href="#sobre" className="hover:text-blue-700">Sobre</a>
          </li>
          <li className="flex items-center gap-1">
            <FaTools /> <a href="#servicos" className="hover:text-blue-700">Serviços</a>
          </li>
          <li className="flex items-center gap-1">
            <FaImages /> <a href="#galeria" className="hover:text-blue-700">Galeria</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
