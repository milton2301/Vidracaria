// src/components/Sobre.jsx
import React, { useEffect, useState } from 'react';

const Sobre = () => {
  const [texto, setTexto] = useState('');

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/configuracoes/sobre`);
        const data = await res.json();
        setTexto(data?.texto || '');
      } catch (err) {
        console.error('Erro ao carregar SOBRE:', err);
      }
    };

    carregar();
  }, []);

  return (
    <section id="sobre" className="py-20 bg-white px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800">Sobre nós</h2>
        <p className="mt-4 text-gray-600 leading-relaxed whitespace-pre-line">
          {texto}
        </p>
      </div>
    </section>
  );
};

export default Sobre;
