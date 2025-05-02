import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { FaEdit, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';

Modal.setAppElement('#root');

const CadastroServico = () => {
    const [modalAberto, setModalAberto] = useState(false);
    const [servicos, setServicos] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({
        id: null,
        titulo: '',
        descricao: '',
        icone: '',
        ativo: true,
        imagem: null,
    });

    const buscarServicos = async () => {
        try {
            const res = await fetch('http://localhost:4000/servicos');
            const data = await res.json();
            setServicos(data);
        } catch (err) {
            Swal.fire('Erro', 'Erro ao buscar serviços', 'error');
        }
    };

    useEffect(() => {
        buscarServicos();
    }, []);

    const handleInput = (e) => {
        const { name, value, type, checked, files } = e.target;
        const val = type === 'checkbox' ? checked : (type === 'file' ? files[0] : value);

        if (type === 'file' && files[0]) {
            setPreview(URL.createObjectURL(files[0]));
        }

        setForm({ ...form, [name]: val });
    };

    const abrirModalNovo = () => {
        setForm({ id: null, titulo: '', descricao: '', icone: '', ativo: true });
        setModalAberto(true);
    };

    const abrirModalEdicao = (servico) => {
        setPreview(null);
        setForm(servico);
        setModalAberto(true);
    };

    const salvarServico = async (e) => {
        e.preventDefault();

        if (!form.titulo || !form.descricao) {
            return Swal.fire('Atenção', 'Preencha os campos obrigatórios', 'warning');
        }

        const metodo = form.id ? 'PUT' : 'POST';
        const url = form.id
            ? `http://localhost:4000/servicos/${form.id}`
            : `http://localhost:4000/servicos`;

        const formData = new FormData();
        formData.append('titulo', form.titulo);
        formData.append('descricao', form.descricao);
        formData.append('icone', form.icone);
        formData.append('ativo', form.ativo);
        if (form.imagem instanceof File) {
            formData.append('imagem', form.imagem);
        }

        try {
            const res = await fetch(url, {
                method: metodo,
                body: formData,
            });

            if (res.ok) {
                Swal.fire('Sucesso', `Serviço ${form.id ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
                setModalAberto(false);
                buscarServicos();
            } else {
                Swal.fire('Erro', 'Erro ao salvar serviço', 'error');
            }
        } catch (err) {
            Swal.fire('Erro', 'Erro ao conectar com o servidor', 'error');
        }
        setPreview(null);
    };


    const removerServico = async (id) => {
        const confirma = await Swal.fire({
            title: 'Tem certeza?',
            text: 'Esse serviço será removido permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'Sim, remover',
        });

        if (confirma.isConfirmed) {
            try {
                const res = await fetch(`http://localhost:4000/servicos/${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    Swal.fire('Removido!', 'Serviço excluído com sucesso.', 'success');
                    buscarServicos();
                } else {
                    Swal.fire('Erro', 'Não foi possível remover o serviço.', 'error');
                }
            } catch (err) {
                Swal.fire('Erro', 'Erro de conexão ao excluir', 'error');
            }
        }
    };


    const opcoesIcones = [
        { nome: 'FaShower', label: 'Box de Banheiro' },
        { nome: 'FaDoorOpen', label: 'Portas e Janelas' },
        { nome: 'FaHome', label: 'Espelhos Decorativos' },
        { nome: 'FaStore', label: 'Vitrines Comerciais' },
        { nome: 'FaCogs', label: 'Outros' },
    ];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-blue-700">Serviços Cadastrados</h1>
                <button
                    onClick={abrirModalNovo}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow inline-flex items-center"
                >
                    <FaPlus className="text-xl mr-2" /> Novo Serviço
                </button>
            </div>

            <input
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="mb-4 w-full max-w-md px-4 py-2 border rounded shadow-sm"
            />

            <div className="overflow-auto bg-white rounded shadow p-4">
                <table className="min-w-full table-auto text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-left text-gray-700">
                            <th className="py-2 px-3">Nome</th>
                            <th className="py-2 px-3">Descrição</th>
                            <th className="py-2 px-3">Ícone/Imagem</th>
                            <th className="py-2 px-3">Ativo</th>
                            <th className="py-2 px-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicos
                            .filter(
                                (s) =>
                                    s.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
                                    s.descricao.toLowerCase().includes(filtro.toLowerCase())
                            )
                            .map((s) => (
                                <tr key={s.id} className="border-t hover:bg-gray-50">
                                    <td className="py-2 px-3">{s.titulo}</td>
                                    <td className="py-2 px-3">{s.descricao}</td>
                                    <td className="py-2 px-3 font-mono text-xs text-gray-700">{s.icone || '-'}
                                        {s.imagem && !(s.imagem instanceof File) && (
                                            <img
                                                src={`http://localhost:4000/uploads/${s.imagem}`}
                                                alt="Imagem atual"
                                                className="w-15 h-15 object-cover mt-2 rounded shadow"
                                            />
                                        )}
                                    </td>
                                    <td className="py-2 px-3">{s.ativo ? 'Sim' : 'Não'}</td>
                                    <td className="py-2 px-3 flex gap-2 justify-center">
                                        <button
                                            onClick={() => abrirModalEdicao(s)}
                                             className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                            title="Editar"
                                        >
                                            <FaEdit className="text-xl inline" />
                                        </button>
                                        <button
                                            onClick={() => removerServico(s.id)}
                                            className="inline-flex fle items-center gap-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                                            title="Excluir"
                                        >
                                            <FaTrash className="text-lg" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de cadastro/edição */}
            <Modal
                isOpen={modalAberto}
                onRequestClose={() => setModalAberto(false)}
                className="w-full max-w-4xl h-[80vh] mx-auto mt-10 bg-white rounded-lg shadow-lg p-8 overflow-y-auto outline-none"
                overlayClassName="fixed inset-0 bg-blue-200 bg-opacity-60 backdrop-blur-sm flex justify-center items-start"
            >
                <h2 className="text-xl font-bold mb-4 text-blue-700">
                    {form.id ? 'Editar Serviço' : 'Novo Serviço'}
                </h2>
                <form onSubmit={salvarServico} className="space-y-4">
                    <input
                        type="text"
                        name="titulo"
                        placeholder="Título do serviço"
                        value={form.titulo}
                        onChange={handleInput}
                        className="w-full border px-3 py-2 rounded"
                        required
                    />

                    <textarea
                        name="descricao"
                        placeholder="Descrição do serviço"
                        value={form.descricao}
                        onChange={handleInput}
                        className="w-full border px-3 py-2 rounded resize-none"
                        rows={3}
                        required
                    />

                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Imagem Visualizar no Orçamento (opcional)</label>
                            <input
                                type="file"
                                name="imagem"
                                accept="image/*"
                                onChange={handleInput}
                                className="w-full border px-3 py-2 rounded cursor-pointer"
                            />
                            {form.imagem && !(form.imagem instanceof File) && (
                                <img
                                    src={`http://localhost:4000/uploads/${form.imagem}`}
                                    alt="Imagem atual"
                                    className="w-32 h-32 object-cover mt-2 rounded shadow"
                                />
                            )}
                            {preview && (
                                <img
                                    src={preview}
                                    alt="Pré-visualização"
                                    className="w-32 h-32 object-cover mt-2 rounded shadow"
                                />
                            )}
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Ícone Visualização Cliente</label>
                            <select
                                name="icone"
                                value={form.icone}
                                onChange={handleInput}
                                className="w-full border px-3 py-2 rounded"
                            >
                                <option value="">Selecione um ícone</option>
                                {opcoesIcones.map((opt) => {
                                    const Icone = FaIcons[opt.nome];
                                    return (
                                        <option key={opt.nome} value={opt.nome}>
                                            {opt.label}
                                        </option>
                                    );
                                })}
                            </select>
                            {form.icone && (
                                <div className="mt-2 text-blue-600 flex items-center gap-2">
                                    Ícone: {React.createElement(FaIcons[form.icone], { className: 'text-2xl' })}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="flex justify-between items-center mt-4">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                name="ativo"
                                checked={form.ativo}
                                onChange={handleInput}
                                className="mr-2"
                            />
                            Ativo
                        </label>

                        <button
                            type="submit"
                            className="bg-blue-600 flex items-center text-white font-semibold px-5 py-2 rounded hover:bg-blue-700"
                        >
                          <FaSave className="mr-2" />  Salvar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CadastroServico;
