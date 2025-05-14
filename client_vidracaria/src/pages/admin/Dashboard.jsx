// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaEdit, FaWhatsapp, FaDownload, FaPlus, FaEye } from 'react-icons/fa';
import OrcamentoModal from '../../components/OrcamentoModal';
import PropostasModal from './PropostasModal';

const Dashboard = () => {
  const [orcamentos, setOrcamentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [statusSelecionados, setStatusSelecionados] = useState(['Novo', 'Em andamento']);
  const [loadingPdfId, setLoadingPdfId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);
  const [modalPropostasAberto, setModalPropostasAberto] = useState(false);
  const [idOrcamento, setIdOrcamento] = useState([]);
  // PAGINAÇÃO: início
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sempre que filtro ou status mudarem, volta para a página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, statusSelecionados]);
  // PAGINAÇÃO: fim
  const fetchOrcamentos = async () => {
    try {
      const res = await fetch(`${base}/orcamentos`);
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

  // PAGINAÇÃO: cálculo dos itens filtrados e páginas
  const filteredOrcamentos = orcamentos.filter((item) => {
    const termo = filtro.toLowerCase();
    return (
      item.nome.toLowerCase().includes(termo) ||
      item.email.toLowerCase().includes(termo) ||
      item.telefone.toLowerCase().includes(termo) ||
      (item.servico?.titulo || '').toLowerCase().includes(termo)
    ) && statusSelecionados.includes(item.status);
  });

  const totalPages = Math.ceil(filteredOrcamentos.length / itemsPerPage);
  const paginatedOrcamentos = filteredOrcamentos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // PAGINAÇÃO: fim

  const abrirModalGerenciar = async (orcamento) => {
    if (orcamento.status === 'Concluído') {
      Swal.fire({
        icon: 'info',
        title: 'Orçamento concluído',
        text: 'Este orçamento já foi finalizado e não pode ser editado.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    // Buscar tipos de vidro
    let tiposVidro = [];
    try {
      const res = await fetch(`${base}/tiposvidro`);
      tiposVidro = await res.json();
    } catch (err) {
      console.error('Erro ao buscar tipos de vidro:', err);
    }

    // Calcular valor se não estiver definido
    let valorCalculado = '';
    if (orcamento.altura && orcamento.largura && orcamento.tipoVidroId) {
      const tipoVidro = tiposVidro.find(tv => tv.id === orcamento.tipoVidroId);
      if (tipoVidro) {
        const area = orcamento.altura * orcamento.largura;
        const valor = area * tipoVidro.valorM2;
        valorCalculado = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
    }

    Swal.fire({
      title: `<span class="text-blue-700 text-xl font-semibold">Editar Orçamento #${orcamento.id}</span>`,
      idth: '700px',
      html: `
            <div class="flex flex-col gap-4 text-left text-gray-700 font-[500]">
              <div>
                <label class="block text-sm mb-1">Observação</label>
                <textarea id="obs" rows="4" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none">${orcamento.observacaoAdmin || ''}</textarea>
              </div>
              <div>
                <label class="block text-sm mb-1">Valor Vidros (Calculo com base no tipo de vidro)</label>
                <input disabled id="valorCalculado" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" value="${valorCalculado}" />
              </div>
              <div>
                <label class="block text-sm mb-1">Valor Final do Orçamento</label>
                <input id="valor" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" value="${orcamento.valor && orcamento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || ''}" />
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
          console.log(result.value.valor);
          const res = await fetch(`${base}/orcamentos/${orcamento.id}`, {
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


  const abrirModalNovaProposta = (orcamento) => {
    setOrcamentoSelecionado(orcamento);
    setModalAberto(true);
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
      const res = await fetch(`${base}/orcamentos/${id}/pdf`);
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
                <th className="py-2 px-3">Valores</th>
                <th className="py-2 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrcamentos
                .filter((item) => {
                  const termo = filtro.toLowerCase();
                  return (
                    item.nome.toLowerCase().includes(termo) ||
                    item.email.toLowerCase().includes(termo) ||
                    item.telefone.toLowerCase().includes(termo) ||
                    (item.servico?.titulo || '').toLowerCase().includes(termo)
                  ) && statusSelecionados.includes(item.status);
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
                            className="inline-flex items-center gap-1 text-green-600 hover:underline"
                          >
                            <FaWhatsapp className="text-md" />
                            {item.telefone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>{item.servico?.titulo || '-'}</div>
                      <div className="text-xs text-gray-500">{item.tipoVidro?.nome || '-'}</div>
                      <div className="text-xs text-gray-500">
                        {item.altura && item.largura ? `${item.altura} cm x ${item.largura} cm` : '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-gray-700 break-words">
                        <b>Cliente: </b> {item.descricao || '-'}
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        <b>Responsável: </b> {item.observacaoAdmin || ''}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700">
                      <div className="text-xs">
                        Criado: {new Date(item.criadoEm).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs">
                        {item.dataAgendamento
                          ? `Agendado: ${new Date(item.dataAgendamento).toLocaleString('pt-BR')}`
                          : '-'}
                      </div>
                    </td>
                    <td className={`px-3 py-2 font-semibold text-sm ${item.status === 'Novo' ? 'text-yellow-500' :
                      item.status === 'Em andamento' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                      {item.status}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-gray-700 break-words">
                        <b>Total: </b> {typeof item.valor === 'number' ? `R$ ${item.valor.toFixed(2)}` : '-'}
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        <b>Vidros: </b>{((item.altura * item.largura) * item.tipoVidro?.valorM2) ? `R$ ${((item.altura * item.largura) * item.tipoVidro.valorM2).toFixed(2)}` : '-'}
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        <b>Mão de obra: </b>{((item.altura * item.largura) * item.tipoVidro?.valorM2) && typeof item.valor === 'number' ? `R$ ${(item.valor - ((item.altura * item.largura) * item.tipoVidro.valorM2)).toFixed(2)}` : '-'}
                      </div>
                    </td>
                    <td className="py-2 px-4 grid grid-cols-2 gap-2 justify-center">
                      <button
                        onClick={() => abrirModalGerenciar(item)}
                        className="justify-center cursor-pointer inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        title="Editar orçamento"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => gerarPdfProposta(item.id)}
                        className="justify-center cursor-pointer inline-flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                        disabled={loadingPdfId === item.id}
                        title="Gerar PDF"
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={() => abrirModalNovaProposta(item)}
                        className="justify-center cursor-pointer inline-flex items-center gap-2 px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                        title="Gerar nova proposta"
                      >
                        <FaPlus /> 
                      </button>
                      <button
                        onClick={() => {
                          setIdOrcamento(item.id || 0);
                          setModalPropostasAberto(true);
                        }}
                        className="justify-center cursor-pointer inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        title="Ver propostas"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

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

      <OrcamentoModal
        isOpen={modalAberto}
        onRequestClose={() => setModalAberto(false)}
        orcamentoBase={orcamentoSelecionado}
      />
      <PropostasModal
        isOpen={modalPropostasAberto}
        onRequestClose={() => setModalPropostasAberto(false)}
        orcamentoId={idOrcamento}
      />
    </div>
  );
};

export default Dashboard;
