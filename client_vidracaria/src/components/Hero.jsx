// src/components/Hero.jsx
import React, { useEffect, useState } from 'react';
import OrcamentoModal from './OrcamentoModal';

const Hero = () => {
  const [modalAberto, setModalAberto] = useState(false);
  const [config, setConfig] = useState({ titulo: '', subtitulo: '' });

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/configuracoes/hero`);
        const data = await res.json();
        setConfig({ titulo: data?.titulo || '', subtitulo: data?.subtitulo || '' });
      } catch (err) {
        console.error('Erro ao carregar HERO:', err);
      }
    };

    carregar();
  }, []);

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-white pt-24 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
          {config.titulo}
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          {config.subtitulo}
        </p>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-blue-700 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition"
        >
          Solicitar Orçamento
        </button>

        <OrcamentoModal isOpen={modalAberto} onRequestClose={() => setModalAberto(false)} />
      </div>
    </section>
  );
};

export default Hero;
