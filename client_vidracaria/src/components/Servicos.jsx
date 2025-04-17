// src/components/Servicos.jsx
import React from 'react';
import { FaDoorOpen, FaShower, FaHome, FaStore } from 'react-icons/fa';

const servicos = [
  {
    titulo: 'Box de Banheiro',
    descricao: 'Modelos modernos, com segurança e durabilidade.',
    icone: <FaShower className="text-4xl text-blue-600 mb-3" />,
  },
  {
    titulo: 'Portas e Janelas',
    descricao: 'Vidros temperados para portas internas e externas.',
    icone: <FaDoorOpen className="text-4xl text-blue-600 mb-3" />,
  },
  {
    titulo: 'Espelhos Decorativos',
    descricao: 'Espelhos sob medida para ambientes sofisticados.',
    icone: <FaHome className="text-4xl text-blue-600 mb-3" />,
  },
  {
    titulo: 'Vitrines Comerciais',
    descricao: 'Design funcional para lojas e ambientes corporativos.',
    icone: <FaStore className="text-4xl text-blue-600 mb-3" />,
  },
];

const Servicos = () => {
  return (
    <section id="servicos" className="py-20 bg-gray-50 px-4 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-10">Nossos Serviços</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {servicos.map((servico, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex justify-center">{servico.icone}</div>
              <h3 className="text-xl font-semibold text-blue-700 mt-2">{servico.titulo}</h3>
              <p className="text-gray-600 text-sm mt-2">{servico.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Servicos;
