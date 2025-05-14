import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { FaEdit, FaSave } from 'react-icons/fa';

Modal.setAppElement('#root');

const CadastroConfiguracoes = () => {
    const [configuracoes, setConfiguracoes] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [form, setForm] = useState({ chave: '', titulo: '', subtitulo: '', texto: '' });

    const buscarConfiguracoes = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/configuracoes`);
            const data = await res.json();
            setConfiguracoes(data);
        } catch (err) {
            Swal.fire('Erro', 'Erro ao buscar configurações', 'error');
        }
    };

    useEffect(() => {
        buscarConfiguracoes();
    }, []);

    const abrirModal = (chave) => {
        const existente = configuracoes.find(c => c.chave === chave);
        setForm({
            chave,
            titulo: existente?.titulo || '',
            subtitulo: existente?.subtitulo || '',
            texto: existente?.texto || ''
        });
        setModalAberto(true);
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const salvar = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/configuracoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                Swal.fire('Sucesso', 'Configuração salva com sucesso!', 'success');
                setModalAberto(false);
                buscarConfiguracoes();
            } else {
                Swal.fire('Erro', 'Erro ao salvar configuração', 'error');
            }
        } catch (err) {
            Swal.fire('Erro', 'Erro de conexão ao salvar', 'error');
        }
    };

    const getConfig = (chave) => configuracoes.find(c => c.chave === chave) || {};

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-xl font-bold text-blue-700 mb-6">Textos do Site</h1>

            {/* Bloco HERO */}
            <div className="bg-white p-6 rounded shadow mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-semibold text-blue-800">Hero</h2>
                        <p className="mt-2 text-gray-700">
                            <strong>{getConfig('hero').titulo || '-'}</strong><br />
                            <span className="text-sm text-gray-600">{getConfig('hero').subtitulo || '-'}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => abrirModal('hero')}
                        className="cursor-pointer inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        title="Editar"
                    >
                        <FaEdit className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Bloco SOBRE */}
            <div className="bg-white p-6 rounded shadow mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-semibold text-blue-800">Sobre nós</h2>
                        <p className="mt-2 text-gray-700 whitespace-pre-line">{getConfig('sobre')?.texto || '-'}</p>
                    </div>
                    <button
                        onClick={() => abrirModal('sobre')}
                        className="cursor-pointer inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        title="Editar"
                    >
                        <FaEdit className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={modalAberto}
                onRequestClose={() => setModalAberto(false)}
                className="w-full max-w-4xl h-[80vh] mx-auto mt-10 bg-white rounded-lg shadow-lg p-8 overflow-y-auto outline-none"
                overlayClassName="fixed inset-0 bg-blue-200 bg-opacity-60 backdrop-blur-sm flex justify-center items-start"
            >
                <h2 className="text-xl font-bold mb-4 text-blue-700">
                    Editar conteúdo: {form.chave === 'hero' ? 'Hero' : 'Sobre nós'}
                </h2>

                <form onSubmit={salvar} className="space-y-4">
                    {form.chave === 'hero' && (
                        <>
                            <textarea
                                type="text"
                                name="titulo"
                                placeholder="Título"
                                value={form.titulo}
                                onChange={handleInput}
                                rows={3}
                                className="w-full border px-3 py-2 rounded"
                                required
                            />

                            <textarea
                                type="text"
                                name="subtitulo"
                                placeholder="Subtítulo"
                                value={form.subtitulo}
                                onChange={handleInput}
                                rows={10}
                                className="w-full border px-3 py-2 rounded"
                            />
                        </>
                    )}

                    {form.chave === 'sobre' && (
                        <textarea
                            name="texto"
                            placeholder="Texto do Sobre nós"
                            value={form.texto}
                            onChange={handleInput}
                            rows={10}
                            className="w-full border px-3 py-2 rounded resize-none"
                            required
                        />
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 flex items-center text-white font-semibold px-5 py-2 rounded hover:bg-blue-700"
                        >
                         <FaSave className="mr-2" />   Salvar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CadastroConfiguracoes;
