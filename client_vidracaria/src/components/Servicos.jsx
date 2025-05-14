// src/components/Servicos.jsx
import React, { useEffect, useState } from 'react';
import * as FaIcons from 'react-icons/fa';

const Servicos = () => {
  const [servicos, setServicos] = useState([]);

  useEffect(() => {
    const buscarServicos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/servicos`);
        const data = await res.json();
        setServicos(data);
      } catch (err) {
        console.error('Erro ao carregar serviços:', err);
      }
    };

    buscarServicos();
  }, []);

  return (
    <section id="servicos" className="py-20 bg-gray-50 px-4 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-10">Nossos Serviços</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {servicos.map((servico, index) => {
            const Icone = FaIcons[servico.icone] || FaIcons.FaCogs;

            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="flex justify-center">
                  <Icone className="text-4xl text-blue-600 mb-3" />
                </div>
                <h3 className="text-xl font-semibold text-blue-700 mt-2">{servico.titulo}</h3>
                <p className="text-gray-600 text-sm mt-2">{servico.descricao}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Servicos;
