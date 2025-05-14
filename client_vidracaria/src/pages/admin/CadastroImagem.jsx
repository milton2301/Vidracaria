import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { FaTrash, FaPlus, FaSave } from 'react-icons/fa';

Modal.setAppElement('#root');

const CadastroImagem = () => {
    const [modalAberto, setModalAberto] = useState(false);
    const [form, setForm] = useState({ tipo: '', descricao: '', imagem: null });
    const [imagens, setImagens] = useState([]);
    const [filtro, setFiltro] = useState('');

    const tiposImagem = ['Imagem Galeria', 'Logo Header', 'Imagem Hero'];

    // PAGINAÇÃO: início
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    useEffect(() => {
        setCurrentPage(1);
    }, [filtro]);
    // PAGINAÇÃO: fim

    const buscarImagens = async () => {
        try {
            const res = await fetch(`${base}/imagens`);
            const data = await res.json();
            setImagens(data);
        } catch (error) {
            Swal.fire('Erro', 'Erro ao carregar imagens', 'error');
        }
    };

    useEffect(() => {
        buscarImagens();
    }, []);

    const handleInput = (e) => {
        const { name, value, files } = e.target;
        if (name === 'imagem') setForm({ ...form, imagem: files[0] });
        else setForm({ ...form, [name]: value });
    };

    const cadastrarImagem = async (e) => {
        e.preventDefault();

        if (!form.imagem || !form.tipo) {
            return Swal.fire('Atenção', 'Preencha todos os campos', 'warning');
        }

        const formData = new FormData();
        formData.append('tipo', form.tipo);
        formData.append('descricao', form.descricao);
        formData.append('imagem', form.imagem);

        try {
            const res = await fetch(`${base}/imagens`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                Swal.fire('Sucesso', 'Imagem cadastrada com sucesso!', 'success');
                setForm({ tipo: '', descricao: '', imagem: null });
                setModalAberto(false);
                buscarImagens();
            } else {
                Swal.fire('Erro', 'Erro ao salvar imagem', 'error');
            }
        } catch (err) {
            Swal.fire('Erro', 'Erro ao conectar ao servidor', 'error');
        }
    };

    const removerImagem = async (id) => {
        const confirma = await Swal.fire({
            title: 'Tem certeza?',
            text: 'Essa imagem será removida permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'Sim, remover',
        });

        if (confirma.isConfirmed) {
            await fetch(`${base}/imagens/${id}`, { method: 'DELETE' });
            buscarImagens();
        }
    };

    // PAGINAÇÃO: filtro e slice
    const imagensFiltradas = Array.isArray(imagens)
        ? imagens.filter(
            (img) =>
                img.tipo.toLowerCase().includes(filtro.toLowerCase()) ||
                img.descricao.toLowerCase().includes(filtro.toLowerCase())
        )
        : [];
    const totalPages = Math.ceil(imagensFiltradas.length / itemsPerPage);
    const paginatedImagens = imagensFiltradas.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    // PAGINAÇÃO: fim

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-blue-700">Imagens do Site</h1>
                <button
                    onClick={() => setModalAberto(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow inline-flex items-center"
                >
                    <FaPlus className='mr-2' /> Nova Imagem
                </button>
            </div>

            <input
                type="text"
                placeholder="Buscar por descrição ou tipo..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="mb-4 w-full max-w-md px-4 py-2 border rounded shadow-sm"
            />

            <div className="overflow-auto bg-white rounded shadow p-4">
                <table className="min-w-full table-auto text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-left text-gray-700">
                            <th className="py-2 px-3">Tipo</th>
                            <th className="py-2 px-3">Descrição</th>
                            <th className="py-2 px-3">Imagem</th>
                            <th className="py-2 px-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedImagens.map((img) => (
                            <tr key={img.id} className="border-t hover:bg-gray-50">
                                <td className="py-2 px-3 font-bold">{img.tipo}</td>
                                <td className="py-2 px-3">{img.descricao}</td>
                                <td className="py-2 px-3">
                                    <img
                                        src={`${base}/uploads/${img.caminho}`}
                                        alt={img.caminho}
                                        className="w-24 rounded shadow-sm"
                                    />
                                </td>
                                <td className="py-2 px-3 text-center">
                                    <button
                                        onClick={() => removerImagem(img.id)}
                                        className="cursor-pointer p-1 inline-flex items-center gap-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                                        title="Excluir"
                                    >
                                        <FaTrash className='text-xl' />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* PAGINAÇÃO: controles */}
                <div className="mt-4 flex justify-end items-center space-x-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded border ${
                            currentPage === 1
                                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        ‹ Anterior
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 rounded border ${
                                currentPage === i + 1
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded border ${
                            currentPage === totalPages
                                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        Próxima ›
                    </button>
                </div>
                {/* PAGINAÇÃO: fim */}
            </div>

            {/* Modal de cadastro */}
            <Modal
                isOpen={modalAberto}
                onRequestClose={() => setModalAberto(false)}
                className="w-full max-w-4xl h-[80vh] mx-auto mt-10 bg-white rounded-lg shadow-lg p-8 overflow-y-auto outline-none"
                overlayClassName="fixed inset-0 bg-blue-200 bg-opacity-60 backdrop-blur-sm flex justify-center items-start"
            >
                <h2 className="text-xl font-bold mb-4 text-blue-700">Cadastro de Imagem</h2>
                <form onSubmit={cadastrarImagem} className="space-y-4">
                    <select
                        name="tipo"
                        value={form.tipo}
                        onChange={handleInput}
                        className="w-full border px-3 py-2 rounded"
                        required
                    >
                        <option value="">Selecione o tipo de imagem</option>
                        {tiposImagem.map((tipo) => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                    </select>

                    <textarea
                        type="text"
                        name="descricao"
                        placeholder="Descrição da imagem"
                        value={form.descricao}
                        onChange={handleInput}
                        rows={5}
                        className="w-full border px-3 py-2 rounded"
                    />

                    <input
                        type="file"
                        name="imagem"
                        accept="image/*"
                        onChange={handleInput}
                        className="w-full border px-3 py-2 rounded cursor-pointer"
                    />

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 flex items-center text-white px-5 py-2 rounded hover:bg-blue-700"
                        >
                         <FaSave className='mr-2' />   Enviar Imagem
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CadastroImagem;