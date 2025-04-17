// src/components/Contato.jsx
import React from 'react';
import { FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';

const Contato = () => {
  return (
    <section id="contato" className="py-20 bg-gray-50 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-10">Fale Conosco</h2>

        <div className="grid gap-8 sm:grid-cols-2 text-left">
          {/* Informações de contato */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-blue-600" />
              <span>(11) 98765-4321</span>
            </div>
            <div className="flex items-center gap-3">
              <FaWhatsapp className="text-green-500" />
              <a href="https://wa.me/5511987654321" target="_blank" rel="noreferrer" className="text-blue-700 underline">
                Enviar mensagem no WhatsApp
              </a>
            </div>
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-red-500" />
              <span>Rua Exemplo, 123 - Centro, SP</span>
            </div>
          </div>

          {/* Formulário de contato */}
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Nome"
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded"
            />
            <textarea
              placeholder="Mensagem"
              rows="4"
              className="w-full px-4 py-2 border rounded"
            ></textarea>
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contato;
