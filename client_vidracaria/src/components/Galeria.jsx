// src/components/Galeria.jsx
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const imagens = [
  '/imagens/box-banheiro.jpg',
  '/imagens/porta-vidro.jpg',
  '/imagens/espelho-decorativo.jpg',
  '/imagens/vitrine-loja.jpg',
  '/imagens/escada-vidro.jpg',
  '/imagens/cobertura.jpg',
];

const Galeria = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024, // tablets e notebooks
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640, // celulares
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section id="galeria" className="py-20 bg-white px-4 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-10">Galeria de Projetos</h2>
        <Slider {...settings}>
          {imagens.map((src, index) => (
            <div key={index} className="px-3">
              <img
                src={src}
                alt={`Projeto ${index + 1}`}
                className="rounded-lg w-full h-72 object-cover shadow-md hover:shadow-lg transition"
              />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Galeria;
