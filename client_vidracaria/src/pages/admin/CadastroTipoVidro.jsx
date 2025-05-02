import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaSave } from 'react-icons/fa';
import { IMaskInput } from 'react-imask';

Modal.setAppElement('#root');

const CadastroTipoVidro = () => {
    const [tipos, setTipos] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [form, setForm] = useState({ id: null, nome: '', descricao: '', valorM2: '' });

    const buscarTipos = async () => {
        try {
            const res = await fetch('http://localhost:4000/tiposvidro');
            const data = await res.json();
            setTipos(data);
        } catch (err) {
            Swal.fire('Erro', 'Erro ao buscar tipos de vidro', 'error');
        }
    };

    useEffect(() => {
        buscarTipos();
    }, []);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const salvar = async (e) => {
        e.preventDefault();

        try {
            const metodo = form.id ? 'PUT' : 'POST';
            const url = form.id ? `http://localhost:4000/tiposvidro/${form.id}` : 'http://localhost:4000/tiposvidro';

            const payload = {
                nome: form.nome,
                descricao: form.descricao,
                valorM2: parseFloat(form.valorM2.replace(/[^0-9,]/g, '').replace(',', '.')),
            };

            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                Swal.fire('Sucesso', `Tipo de vidro ${form.id ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
                setModalAberto(false);
                buscarTipos();
            } else {
                Swal.fire('Erro', 'Erro ao salvar tipo de vidro', 'error');
            }
        } catch (err) {
            Swal.fire('Erro', 'Erro ao conectar com o servidor', 'error');
        }
    };

    const editar = (tipo) => {
        setForm(tipo);
        setModalAberto(true);
    };

    const remover = async (id) => {
        const confirma = await Swal.fire({
            title: 'Tem certeza?',
            text: 'Esse tipo de vidro será removido. Esta ação não poderá ser desfeita.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'Sim, remover',
        });

        if (confirma.isConfirmed) {
            try {
                const res = await fetch(`http://localhost:4000/tiposvidro/${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    Swal.fire('Removido!', 'Tipo de vidro excluído com sucesso.', 'success');
                    buscarTipos();
                } else {
                    Swal.fire('Erro', 'Não foi possível remover o tipo de vidro.', 'error');
                }
            } catch (err) {
                Swal.fire('Erro', 'Erro de conexão ao excluir', 'error');
            }
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-blue-700">Tipos de Vidro</h1>
                <button
                    onClick={() => { setForm({ id: null, nome: '', descricao: '', valorM2: '' }); setModalAberto(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow inline-flex items-center"
                >
                    <FaPlus className="text-xl mr-2" /> Novo Tipo
                </button>
            </div>

            <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="mb-4 w-full max-w-md px-4 py-2 border rounded shadow-sm"
            />

            <div className="overflow-auto bg-white rounded shadow p-4">
                <table className="min-w-full table-auto text-sm">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-gray-700">
                            <th className="py-2 px-3">Nome</th>
                            <th className="py-2 px-3">Descrição</th>
                            <th className="py-2 px-3">Valor M²</th>
                            <th className="py-2 px-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tipos.filter((t) =>
                            t.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                            (t.descricao?.toLowerCase().includes(filtro.toLowerCase()) ?? false)
                        ).map((t) => (
                            <tr key={t.id} className="border-t hover:bg-gray-50">
                                <td className="py-2 px-3">{t.nome}</td>
                                <td className="py-2 px-3">{t.descricao}</td>
                                <td className="py-2 px-3">R$ {t.valorM2.toFixed(2)}</td>
                                <td className="py-2 px-3 flex gap-2 justify-center">
                                    <button onClick={() => editar(t)} className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        title="Editar">
                                        <FaEdit className="text-xl inline" />
                                    </button>
                                    <button onClick={() => remover(t.id)} className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition" title="Excluir">
                                        <FaTrash className="text-lg" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={modalAberto}
                onRequestClose={() => setModalAberto(false)}
                className="w-full max-w-2xl mx-auto mt-20 bg-white rounded-lg shadow-lg p-8 outline-none"
                overlayClassName="fixed inset-0 bg-blue-200 bg-opacity-60 backdrop-blur-sm flex justify-center items-start"
            >
                <h2 className="text-xl font-bold mb-4 text-blue-700">
                    {form.id ? 'Editar Tipo de Vidro' : 'Novo Tipo de Vidro'}
                </h2>
                <form onSubmit={salvar} className="space-y-4">
                    <input
                        type="text"
                        name="nome"
                        value={form.nome}
                        onChange={handleInput}
                        placeholder="Nome do tipo de vidro"
                        required
                        className="w-full border px-4 py-2 rounded"
                    />
                    <textarea
                        name="descricao"
                        value={form.descricao}
                        onChange={handleInput}
                        placeholder="Descrição"
                        className="w-full border px-4 py-2 rounded resize-none"
                        rows={3}
                    />
                    <IMaskInput
                        mask={Number}
                        radix=","
                        scale={2}
                        signed={false}
                        thousandsSeparator="."
                        padFractionalZeros={true}
                        normalizeZeros={true}
                        min={0}
                        name="valorM2"
                        value={String(form.valorM2 || '')}
                        onAccept={(value) => setForm({ ...form, valorM2: value })}
                        placeholder="Valor por metro quadrado"
                        className="w-full border px-4 py-2 rounded"
                        required
                    />
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                          <FaSave className="inline mr-2" />  Salvar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CadastroTipoVidro;