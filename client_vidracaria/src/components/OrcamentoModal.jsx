// src/components/OrcamentoModal.jsx
import React, { useState } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { IMaskInput } from 'react-imask';


Modal.setAppElement('#root'); // importante para acessibilidade

const OrcamentoModal = ({ isOpen, onRequestClose }) => {
    const [form, setForm] = useState({
        nome: '',
        email: '',
        telefone: '',
        servico: '',
        tipoVidro: '',
        altura: '',
        largura: '',
        descricao: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const dadosConvertidos = {
                ...form,
                altura: form.altura ? parseFloat(form.altura.toString().replace(',', '.')) : null,
                largura: form.largura ? parseFloat(form.largura.toString().replace(',', '.')) : null,
              };

            const response = await fetch('http://localhost:4000/orcamentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosConvertidos)
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Enviado!',
                    text: 'Seu orçamento foi enviado com sucesso.',
                    confirmButtonColor: '#2563eb', // azul do Tailwind
                });

                onRequestClose();
                setForm({
                    nome: '',
                    email: '',
                    telefone: '',
                    servico: '',
                    tipoVidro: '',
                    altura: '',
                    largura: '',
                    descricao: '',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao enviar',
                    text: 'Tente novamente mais tarde.',
                });
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro de conexão',
                text: 'Não foi possível conectar com o servidor.',
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Solicitação de Orçamento"
            className="max-w-xl mx-auto mt-20 bg-white rounded-lg shadow-lg p-8 outline-none"
            overlayClassName="fixed inset-0 bg-blue-200 bg-opacity-60 backdrop-blur-sm flex justify-center items-start"
        >

            <h2 className="text-2xl font-bold mb-6 text-blue-700">Solicitar Orçamento</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="nome"
                    type="text"
                    placeholder="Seu nome"
                    value={form.nome}
                    onChange={handleChange}
                    required
                    className="w-full border px-4 py-2 rounded"
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Seu e-mail"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border px-4 py-2 rounded"
                />
                <IMaskInput
                    mask="(00) 00000-0000"
                    value={form.telefone}
                    onAccept={(value) => setForm({ ...form, telefone: value })}
                    placeholder="Telefone"
                    required
                    className="w-full border px-4 py-2 rounded"
                />
                <select
                    name="servico"
                    value={form.servico}
                    onChange={handleChange}
                    required
                    className="w-full border px-4 py-2 rounded"
                >
                    <option value="">Selecione o tipo de item</option>
                    <option value="Porta de vidro">Porta de vidro</option>
                    <option value="Janela de vidro">Janela de vidro</option>
                    <option value="Box para banheiro">Box para banheiro</option>
                    <option value="Espelho decorativo">Espelho decorativo</option>
                    <option value="Vitrine comercial">Vitrine comercial</option>
                    <option value="Outro">Outro</option>
                </select>
                <select
                    name="tipoVidro"
                    value={form.tipoVidro}
                    onChange={handleChange}
                    required
                    className="w-full border px-4 py-2 rounded"
                >
                    <option value="">Selecione o tipo de vidro</option>
                    <option value="Vidro temperado">Vidro temperado</option>
                    <option value="Vidro laminado">Vidro laminado</option>
                    <option value="Vidro comum (float)">Vidro comum (float)</option>
                    <option value="Vidro espelhado">Vidro espelhado</option>
                    <option value="Vidro jateado">Vidro jateado</option>
                    <option value="Vidro serigrafado">Vidro serigrafado</option>
                    <option value="Vidro acidado (fosco)">Vidro acidado (fosco)</option>
                    <option value="Vidro refletivo">Vidro refletivo</option>
                    <option value="Vidro blindado">Vidro blindado</option>
                    <option value="Outro">Outro</option>
                </select>
                <div className="flex gap-4">
                    <input
                        name="altura"
                        type="text"
                        inputMode="decimal"
                        placeholder="Altura (cm)"
                        value={form.altura}
                        onChange={handleChange}
                        required
                        min="0"
                        className="w-full border px-4 py-2 rounded"
                    />
                    <input
                        name="largura"
                        type="text"
                        inputMode="decimal"
                        placeholder="Largura (cm)"
                        value={form.largura}
                        onChange={handleChange}
                        required
                        min="0"
                        className="w-full border px-4 py-2 rounded"
                    />
                </div>
                <textarea
                    name="descricao"
                    rows="4"
                    placeholder="Descreva seu projeto"
                    value={form.descricao}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded"
                />
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onRequestClose}
                        className="px-4 py-2 rounded border"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                    >
                        Enviar
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default OrcamentoModal;
