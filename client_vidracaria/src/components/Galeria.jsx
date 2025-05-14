import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Galeria.css'; // Se tiver estilos próprios, mantenha

const Galeria = () => {
  const [imagens, setImagens] = useState([]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  useEffect(() => {
    const carregarImagens = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/imagens`);
        const data = await res.json();
        const galeria = data.filter(img => img.tipo === 'Imagem Galeria');
        setImagens(galeria);
      } catch (error) {
        console.error('Erro ao buscar imagens da galeria:', error);
      }
    };

    carregarImagens();
  }, []);

  return (
    <section id="galeria" className="py-20 bg-white px-4 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-10">Galeria de Projetos</h2>
        <div className="overflow-hidden">
          <Slider {...settings}>
            {imagens.map((img, index) => (
              <div key={index} className="px-3">
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${img.caminho}`}
                  alt={img.descricao || `Projeto ${index + 1}`}
                />
                <div>{img.descricao}</div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default Galeria;
