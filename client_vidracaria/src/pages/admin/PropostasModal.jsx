// src/components/PropostasModal.jsx
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import Swal from 'sweetalert2';

Modal.setAppElement('#root');

const PropostasModal = ({ isOpen, onRequestClose, orcamentoId, reload }) => {
    const [propostas, setPropostas] = useState([]);

    const buscarPropostas = async () => {
        if (!orcamentoId) return;
        try {
            const res = await fetch(`http://localhost:4000/propostas/${orcamentoId}`);
            const data = await res.json();
            setPropostas(data);
        } catch (err) {
            console.error('Erro ao buscar propostas:', err);
        }
    };

    useEffect(() => {
        if (isOpen) buscarPropostas();
    }, [orcamentoId, isOpen]);

    const confirmarDelecao = async (id) => {
        const confirm = await Swal.fire({
            title: 'Tem certeza?',
            text: 'Essa proposta será removida permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
        });

        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`http://localhost:4000/propostas/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    Swal.fire('Removido!', 'Proposta excluída com sucesso.', 'success');
                    reload?.(); // Atualiza orçamentos no componente pai
                } else {
                    Swal.fire('Erro', 'Falha ao excluir a proposta.', 'error');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Erro', 'Erro de conexão ao excluir.', 'error');
            }
        }
    };

    const editarProposta = async (p) => {
        let valorCalculado = '';
        if (p.altura && p.largura && p.tipoVidro?.valorM2) {
            const area = p.altura * p.largura;
            const valor = area * p.tipoVidro.valorM2;
            valorCalculado = valor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });
        }
    
        const { value: formValues } = await Swal.fire({
            title: `<span class="text-blue-700 text-xl font-semibold">Editar Proposta #${p.id}</span>`,
            width: '600px',
            html: `
                <div class="flex flex-col gap-4 text-left text-gray-700 font-[500]">
                    <div>
                        <label class="block text-sm mb-1">Observação</label>
                        <textarea id="descricao" rows="4" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none">${p.observacaoAdmin || ''}</textarea>
                    </div>
                    <div>
                        <label class="block text-sm mb-1">Valor Vidros (Calculo com base no tipo de vidro)</label>
                        <input disabled id="valorCalculado" type="text" class="w-full border px-3 py-2 rounded-md bg-gray-100" value="${valorCalculado}" />
                    </div>
                    <div>
                        <label class="block text-sm mb-1">Valor final da proposta</label>
                        <input id="valor" type="text" class="w-full border px-3 py-2 rounded-md" value="${p.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || ''}" />
                    </div>
                </div>
            `,
            focusConfirm: false,
            confirmButtonText: 'Salvar',
            didOpen: () => {
                const valorInput = document.getElementById('valor');
                valorInput.addEventListener('input', (e) => {
                    let value = e.target.value;
                    value = value.replace(/\D/g, '');
                    value = (Number(value) / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    });
                    e.target.value = value;
                });
            },
            preConfirm: () => {
                const observacaoAdmin = document.getElementById('descricao').value;
                const valor = document.getElementById('valor').value;
                return {
                    id: p.id,
                    observacaoAdmin,
                    valor: parseFloat(valor.replace(/\D/g, '')) / 100 || 0
                };
            },
        });
    
        if (formValues) {
            try {
                const res = await fetch(`http://localhost:4000/propostas/${p.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        observacaoAdmin: formValues.observacaoAdmin,
                        valor: formValues.valor,
                    }),
                });
    
                if (res.ok) {
                    Swal.fire('Sucesso', 'Proposta atualizada com sucesso!', 'success');
                    buscarPropostas();
                } else {
                    Swal.fire('Erro', 'Não foi possível salvar as alterações.', 'error');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Erro', 'Erro de conexão com o servidor.', 'error');
            }
        }
    };
    


    const gerarPdfProposta = async (id) => {
        try {
            const res = await fetch(`http://localhost:4000/propostas/${id}/pdf`);
            if (!res.ok) throw new Error('Erro ao gerar PDF');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `proposta_${id}.pdf`;
            link.click();
        } catch (error) {
            Swal.fire('Erro', 'Não foi possível gerar o PDF da proposta.', 'error');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Propostas Vinculadas"
            className="w-full max-w-5xl h-[80vh] mx-auto mt-20 bg-white rounded-lg shadow-lg p-6 overflow-y-auto outline-none"
            overlayClassName="fixed inset-0 bg-blue-200 bg-opacity-60 backdrop-blur-sm flex justify-center items-start"
        >
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Propostas vinculadas</h2>
            <div className="overflow-auto bg-white rounded shadow">
                <table className="min-w-full table-auto text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left">Serviço</th>
                            <th className="px-4 py-2 text-left">Tipo de Vidro</th>
                            <th className="px-4 py-2 text-left">Tamanho</th>
                            <th className="px-4 py-2 text-left">Valor</th>
                            <th className="px-4 py-2 text-left">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {propostas?.length > 0 ? (
                            propostas.map((p) => (
                                <tr key={p.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{p.servico?.titulo || '-'}</td>
                                    <td className="px-4 py-2">{p.tipoVidro?.nome || '-'}</td>
                                    <td className="px-4 py-2">
                                        {p.altura && p.largura ? `${p.altura} x ${p.largura} cm` : '-'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {typeof p.valor === 'number' ? `R$ ${p.valor.toFixed(2)}` : '-'}
                                    </td>
                                    <td className="px-4 py-2 flex gap-3">
                                        <button
                                            onClick={() => editarProposta(p)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Editar"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => confirmarDelecao(p.id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Excluir"
                                        >
                                            <FaTrash />
                                        </button>
                                        <button
                                            onClick={() => gerarPdfProposta(p.id)}
                                            className="text-green-600 hover:text-green-800"
                                            title="Gerar PDF"
                                        >
                                            <FaDownload />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-gray-500 italic">
                                    Nenhuma proposta vinculada
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end mt-6">
                <button
                    onClick={onRequestClose}
                    className="px-5 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    Fechar
                </button>
            </div>
        </Modal>
    );
};

export default PropostasModal;
