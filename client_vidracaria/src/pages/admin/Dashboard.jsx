// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaEdit } from 'react-icons/fa';
import { FaWhatsapp, FaDownload } from 'react-icons/fa';

const Dashboard = () => {
    const [orcamentos, setOrcamentos] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [statusSelecionados, setStatusSelecionados] = useState(['Novo', 'Em andamento']);
    const [loadingPdfId, setLoadingPdfId] = useState(null);


    const fetchOrcamentos = async () => {
        try {
            const res = await fetch('http://localhost:4000/orcamentos');
            if (!res.ok) throw new Error('Erro ao buscar dados');
            const data = await res.json();
            setOrcamentos(data);
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível carregar os orçamentos.' });
        }
    };

    useEffect(() => {
        fetchOrcamentos();
    }, []);


    const abrirModalGerenciar = (orcamento) => {
        if (orcamento.status === 'Concluído') {
            Swal.fire({
                icon: 'info',
                title: 'Orçamento concluído',
                text: 'Este orçamento já foi finalizado e não pode ser editado.',
                confirmButtonColor: '#2563eb',
            });
            return;
        }
        Swal.fire({
            title: `<span class="text-blue-700 text-xl font-semibold">Editar Orçamento #${orcamento.id}</span>`,
            html: `
              <div class="flex flex-col gap-4 text-left text-gray-700 font-[500]">
                <div>
                  <label class="block text-sm mb-1">Observação</label>
                  <textarea id="obs" rows="4" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none">${orcamento.observacaoAdmin || ''}</textarea>
                </div>
                <div>
                  <label class="block text-sm mb-1">Valor do Orçamento</label>
                  <input id="valor" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" value="${orcamento.valor || ''}" />
                </div>
                <div>
                  <label class="block text-sm mb-1">Status</label>
                  <select id="status" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    <option value="Novo" ${orcamento.status === 'Novo' ? 'selected' : ''}>Novo</option>
                    <option value="Em andamento" ${orcamento.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
                    <option value="Concluído" ${orcamento.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm mb-1">Data de Agendamento</label>
                  <input id="data" type="datetime-local" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value="${orcamento.dataAgendamento ? new Date(orcamento.dataAgendamento).toISOString().slice(0, 16) : ''}" />
                </div>
              </div>
            `,
            focusConfirm: false,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            customClass: {
                popup: 'p-6 rounded-xl shadow-xl',
                confirmButton: 'bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition',
                cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition',
            },
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
                const obs = document.getElementById('obs').value;
                const data = document.getElementById('data').value;
                const status = document.getElementById('status').value;
                const valor = document.getElementById('valor').value;
                return { obs, data, status, valor };
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`http://localhost:4000/orcamentos/${orcamento.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            observacaoAdmin: result.value.obs,
                            dataAgendamento: result.value.data || null,
                            status: result.value.status,
                            valor: result.value.valor,
                        }),
                    });

                    if (res.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Atualizado!',
                            text: 'Informações salvas com sucesso.',
                            confirmButtonColor: '#2563eb',
                        });
                        fetchOrcamentos();
                    } else {
                        Swal.fire('Erro', 'Falha ao salvar no servidor.', 'error');
                    }
                } catch (err) {
                    Swal.fire('Erro', 'Erro de conexão.', 'error');
                }
            }
        });

    };

    const limparTelefone = (numero) => numero.replace(/\D/g, '');

    const gerarLinkWhatsapp = (numero, nome) => {
        const mensagem = `Olá ${nome}, tudo bem? Estou entrando em contato sobre o orçamento solicitado em nossa vidraçaria.`;
        const mensagemCodificada = encodeURIComponent(mensagem);
        return `https://wa.me/55${limparTelefone(numero)}?text=${mensagemCodificada}`;
    };

    const gerarPdfProposta = async (id) => {
        setLoadingPdfId(id);
        try {
            const res = await fetch(`http://localhost:4000/orcamentos/${id}/pdf`);
            if (!res.ok) throw new Error('Erro ao gerar PDF');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `proposta_${id}.pdf`;
            link.click();
        } catch (error) {
            Swal.fire('Erro', 'Não foi possível gerar a proposta.', 'error');
        } finally {
            setLoadingPdfId(null);
        }
    };



    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold text-blue-800 mb-6">Orçamentos</h1>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nome, email, telefone ou serviço..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="w-full sm:w-1/2 px-4 py-2 border rounded shadow-sm"
                />
                <div className="flex flex-wrap items-center gap-6 mt-3">
                    {['Novo', 'Em andamento', 'Concluído'].map((status) => (
                        <label key={status} className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                value={status}
                                checked={statusSelecionados.includes(status)}
                                onChange={(e) => {
                                    const { value, checked } = e.target;
                                    setStatusSelecionados((prev) =>
                                        checked ? [...prev, value] : prev.filter((s) => s !== value)
                                    );
                                }}
                                className="accent-blue-600"
                            />
                            {status}
                        </label>
                    ))}
                </div>

            </div>

            <div className="overflow-auto bg-white rounded shadow p-4">
                <div className="min-w-[1024px]">
                    <table className="w-full table-auto text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-left border-b text-sm text-gray-700">
                                <th className="py-2 px-3">Dados Cliente</th>
                                <th className="py-2 px-3">Detalhes Serviço</th>
                                <th className="py-2 px-3">Observações</th>
                                <th className="py-2 px-3">Datas</th>
                                <th className="py-2 px-3">Status</th>
                                <th className="py-2 px-3">Valor Orçamento</th>
                                <th className="py-2 px-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orcamentos
                                .filter((item) => {
                                    const termo = filtro.toLowerCase();

                                    const correspondeBusca =
                                        item.nome.toLowerCase().includes(termo) ||
                                        item.email.toLowerCase().includes(termo) ||
                                        item.telefone.toLowerCase().includes(termo) ||
                                        item.servico.toLowerCase().includes(termo);
                                    const correspondeStatus = statusSelecionados.includes(item.status);
                                    return correspondeBusca && correspondeStatus;
                                })
                                .map((item, idx) => (
                                    <tr key={idx} className="border-t hover:bg-gray-50 align-top text-sm">
                                        <td className="px-3 py-2">
                                            <div className="font-medium text-gray-800">{item.nome}</div>
                                            <div className="text-xs text-gray-500">{item.email}</div>
                                            <div className="text-xs text-gray-500">
                                                {item.telefone?.length >= 10 && (
                                                    <a
                                                        href={gerarLinkWhatsapp(item.telefone, item.nome)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="WhatsApp"
                                                        className="inline-flex items-center gap-1 text-green-600 hover:underline"
                                                    >
                                                        <FaWhatsapp className="text-md" />
                                                        {item.telefone}
                                                    </a>
                                                )}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div>{item.servico}</div>
                                            <div className="text-xs text-gray-500">{item.tipoVidro || '-'}</div>
                                            <div className="text-xs text-gray-500">
                                                {item.altura && item.largura ? `${item.altura} cm x ${item.largura} cm` : 'x cm'}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="text-xs text-gray-700 break-words">
                                                <b>Cliente: </b> {item.descricao || '-'}
                                            </div>
                                            <div className="text-xs text-gray-500 italic"><b>Responsável: </b> {item.observacaoAdmin || ''}</div>
                                        </td>

                                        <td className="px-3 py-2 text-xs text-gray-700">
                                            <div className="text-xs text-gray-700 break-words">
                                                Criado: {new Date(item.criadoEm).toLocaleDateString('pt-BR')}
                                            </div>
                                            <div className="text-xs text-gray-700 break-words">
                                                {item.dataAgendamento
                                                    ? `Agendado: ${new Date(item.dataAgendamento).toLocaleString('pt-BR')}`
                                                    : '-'}
                                            </div>
                                        </td>
                                        <td
                                            className={`px-3 py-2 font-semibold text-sm ${item.status === 'Novo'
                                                ? 'text-yellow-500'
                                                : item.status === 'Em andamento'
                                                    ? 'text-blue-600'
                                                    : item.status === 'Concluído'
                                                        ? 'text-green-600'
                                                        : 'text-gray-500'
                                                }`}
                                        >
                                            {item.status}
                                        </td>
                                        <td className="px-3 py-2">
                                            {item.valor ? `R$ ${item.valor.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="py-2 px-4 flex gap-2">
                                            <button
                                                onClick={() => abrirModalGerenciar(item)}
                                                className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                            >
                                                <FaEdit className="text-white" />
                                            </button>
                                            <button
                                                onClick={() => gerarPdfProposta(item.id)}
                                                className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                                                disabled={loadingPdfId === item.id}
                                            >
                                                {loadingPdfId === item.id ? (
                                                    <svg
                                                        className="animate-spin h-4 w-4 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8v8H4z"
                                                        ></path>
                                                    </svg>
                                                ) : (
                                                    <FaDownload className="text-white" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;