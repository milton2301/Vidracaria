// src/components/OrcamentoModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { IMaskInput } from 'react-imask';

Modal.setAppElement('#root');

const OrcamentoModal = ({ isOpen, onRequestClose, orcamentoBase, onSubmit }) => {
    const [servicos, setServicos] = useState([]);
    const [tiposVidro, setTiposVidro] = useState([]);
    const [form, setForm] = useState({
        nome: '',
        email: '',
        telefone: '',
        servicoId: '',
        tipoVidroId: '',
        altura: '',
        largura: '',
        descricao: '',
    });

    useEffect(() => {
        const buscarServicos = async () => {
            try {
                const res = await fetch('http://localhost:4000/servicos');
                const data = await res.json();
                setServicos(data.filter(s => s.ativo));
            } catch (err) {
                console.error('Erro ao buscar serviços', err);
            }
        };

        const buscarTiposVidro = async () => {
            try {
                const res = await fetch('http://localhost:4000/tiposvidro');
                const data = await res.json();
                setTiposVidro(data);
            } catch (err) {
                console.error('Erro ao buscar tipos de vidro', err);
            }
        };

        if (isOpen) buscarTiposVidro();

        if (isOpen) buscarServicos();
    }, [isOpen]);

    useEffect(() => {
        if (orcamentoBase) {
            setForm({
                nome: orcamentoBase.nome || '',
                email: orcamentoBase.email || '',
                telefone: orcamentoBase.telefone || '',
                servicoId: orcamentoBase.servicoId || '',
                tipoVidroId: orcamentoBase.tipoVidroId || '',
                altura: orcamentoBase.altura || '',
                largura: orcamentoBase.largura || '',
                descricao: orcamentoBase.descricao || '',
            });
        }
    }, [orcamentoBase, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
      
        setForm((prev) => ({
          ...prev,
          [name]: value,
          ...(name === 'tipoVidroId' && { tipoVidroId: parseInt(value) || null }),
        }));
      };
      

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const dadosConvertidos = {
                ...form,
                altura: form.altura ? parseFloat(form.altura.toString().replace(',', '.')) : null,
                largura: form.largura ? parseFloat(form.largura.toString().replace(',', '.')) : null,
            };

            let url = 'http://localhost:4000/orcamentos';
            let body = dadosConvertidos;

            // Se for uma nova proposta, muda o endpoint e adiciona o orcamentoId
            if (orcamentoBase) {
                url = 'http://localhost:4000/propostas';
                body = {
                    ...dadosConvertidos,
                    orcamentoId: orcamentoBase.id,
                };
            }

            if (onSubmit && orcamentoBase?.id) {
                await onSubmit({ ...body, id: orcamentoBase.id });
            } else {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
            
                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: orcamentoBase ? 'Proposta criada com sucesso.' : 'Orçamento enviado com sucesso.',
                        confirmButtonColor: '#2563eb',
                    });
            
                    onRequestClose();
                    setForm({
                        nome: '',
                        email: '',
                        telefone: '',
                        servicoId: '',
                        tipoVidroId: '',
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
            }            

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: orcamentoBase ? 'Proposta criada com sucesso.' : 'Orçamento enviado com sucesso.',
                    confirmButtonColor: '#2563eb',
                });

                onRequestClose();
                setForm({
                    nome: '',
                    email: '',
                    telefone: '',
                    servicoId: '',
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
            <h2 className="text-2xl font-bold mb-6 text-blue-700">
                {orcamentoBase ? 'Nova Proposta' : 'Solicitar Orçamento'}
            </h2>
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
                    name="servicoId"
                    value={form.servicoId || ''}
                    onChange={handleChange}
                    required
                    className="w-full border px-4 py-2 rounded"
                >
                    <option value="">Selecione o tipo de serviço</option>
                    {servicos.map((s) => (
                        <option key={s.id} value={s.id}>{s.titulo}</option>
                    ))}
                </select>
                <select
                    name="tipoVidroId"
                    value={form.tipoVidroId || ''}
                    onChange={handleChange}
                    required
                    className="w-full border px-4 py-2 rounded"
                >
                    <option value="">Selecione o tipo de vidro</option>
                    {tiposVidro.map((tv) => (
                        <option key={tv.id} value={tv.id}>
                            {tv.nome}
                        </option>
                    ))}
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
