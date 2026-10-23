import React, { useState, useEffect, useCallback } from 'react';
import { clubService } from '../../services/clubService';
import { marketService } from '../../services/marketService';
import { useAppStore } from '../../store/useAppStore';
import type {
  Club,
  ClubSortOption,
  ClubWithSquad,
  Player,
  Transaction,
  TransactionSummary,
} from '../../types';
import {
  formatCurrency,
  formatCashChange,
  formatDateTime,
} from '../../utils/formatters';

import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { AlertBanner } from '../../components/shared/AlertBanner';
import { EmptyState } from '../../components/shared/EmptyState';

import { CreateClubModal } from './components/CreateClubModal';
import { SellPlayerModal } from './components/SellPlayerModal';
import { LineupSection } from './components/LineupSection';

type TransactionTypeFilter = 'ALL' | 'COMPRA' | 'VENDA';

const TYPE_OPTIONS: Array<{ value: TransactionTypeFilter; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'COMPRA', label: 'Compras' },
  { value: 'VENDA', label: 'Vendas' },
];

export const ClubsPage: React.FC = () => {
  const { selectedClubId, setSelectedClubId } = useAppStore();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<ClubWithSquad | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const [activeTab, setActiveTab] = useState<
    'elenco' | 'escalacao' | 'historico'
  >('elenco');
  const [sort, setSort] = useState<ClubSortOption>('name');

  // Estados do Histórico de Transações
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('ALL');
  const [playerSearch, setPlayerSearch] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingClubDetails, setLoadingClubDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSellPlayer, setSelectedSellPlayer] = useState<Player | null>(
    null
  );

  // Busca a lista geral de clubes passando o parâmetro sort para a API (RN11)
  const fetchClubs = useCallback(async () => {
    try {
      setLoadingClubs(true);
      setError(null);
      const data = await clubService.getClubs(sort);
      setClubs(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar lista de clubes.';
      setError(message);
    } finally {
      setLoadingClubs(false);
    }
  }, [sort]);

  // Busca detalhes de um clube específico
  const fetchClubDetails = useCallback(async (id: number) => {
    try {
      setLoadingClubDetails(true);
      const data = await clubService.getClubById(id);
      setSelectedClub(data);
    } catch (err) {
      console.error('Erro ao buscar detalhes do clube:', err);
    } finally {
      setLoadingClubDetails(false);
    }
  }, []);

  // Busca histórico de transações do clube
  const fetchClubTransactions = useCallback(
    async (id: number) => {
      try {
        setLoadingHistory(true);
        const typeParam = typeFilter === 'ALL' ? undefined : typeFilter;
        const response = await marketService.getTransactions(id, {
          type: typeParam,
        });
        setTransactions(Array.isArray(response?.data) ? response.data : []);
        setSummary(response?.summary || null);
      } catch (err) {
        console.error('Erro ao buscar histórico do clube:', err);
        setTransactions([]);
      } finally {
        setLoadingHistory(false);
      }
    },
    [typeFilter]
  );

  // Efeito para carregar clubes ao iniciar ou mudar a ordenação
  useEffect(() => {
    let isSubscribed = true;

    const loadClubsData = async () => {
      await Promise.resolve();
      if (isSubscribed) {
        fetchClubs();
      }
    };

    loadClubsData();

    return () => {
      isSubscribed = false;
    };
  }, [fetchClubs]);

  // Efeito para carregar detalhes e histórico quando um clube estiver selecionado
  useEffect(() => {
    let isSubscribed = true;

    const loadDetails = async () => {
      await Promise.resolve();
      if (isSubscribed && selectedClubId) {
        fetchClubDetails(selectedClubId);
        if (activeTab === 'historico') {
          fetchClubTransactions(selectedClubId);
        }
      }
    };

    loadDetails();

    return () => {
      isSubscribed = false;
    };
  }, [selectedClubId, fetchClubDetails, activeTab, fetchClubTransactions]);

  const handleSelectClub = (clubId: number) => {
    setSelectedClubId(clubId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
  };

  const filteredTransactions = (transactions || []).filter((t) =>
    t.player_name?.toLowerCase().includes(playerSearch.toLowerCase())
  );

  const handleExportCSV = async () => {
    if (!selectedClub) return;
    try {
      const typeParam = typeFilter === 'ALL' ? undefined : typeFilter;
      const blobData = await marketService.exportTransactionsCSV(
        selectedClub.id,
        {
          type: typeParam,
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([blobData], { type: 'text/csv;charset=utf-8;' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historico_${selectedClub.acronym}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar CSV da API:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* TELA 1: LISTAGEM GERAL DE CLUBES */}
      {viewMode === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Clubes</h1>
              <p className="text-sm text-slate-400">
                Cada clube começa com R$ 300,00 em caixa e sem jogadores. A liga
                aceita no máximo 20 clubes.
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
            >
              + Novo Clube
            </button>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Clubes Cadastrados ({clubs.length}/20)
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Ordenar por:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ClubSortOption)}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="net_worth_desc">Maior Patrimônio</option>
                <option value="net_worth_asc">Menor Patrimônio</option>
              </select>
            </div>
          </div>

          {error && <AlertBanner message={error} onRetry={fetchClubs} />}

          {loadingClubs ? (
            <LoadingSkeleton type="card" count={4} />
          ) : clubs.length === 0 ? (
            <EmptyState
              title="Nenhum clube cadastrado"
              description="Crie o primeiro clube da liga para começar a montar os elencos."
              actionLabel="Criar Primeiro Clube"
              onAction={() => setIsCreateOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white text-base">
                          {c.name}
                        </h3>
                        <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                          Sigla: {c.acronym}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs bg-slate-800 font-mono font-semibold text-slate-300 border border-slate-700">
                        {c.squad_value > 0 ? 'Com Elenco' : 'Sem Elenco'}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">
                          Caixa Disponível
                        </span>
                        <span className="font-bold text-emerald-400 text-sm font-mono">
                          R$ {formatCurrency(c.cash)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">
                          Valor do Elenco
                        </span>
                        <span className="font-bold text-slate-200 text-sm font-mono">
                          R$ {formatCurrency(c.squad_value)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Patrimônio Líquido
                      </span>
                      <span className="text-sm font-bold font-mono text-teal-300">
                        R$ {formatCurrency(c.net_worth)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleSelectClub(c.id)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-xs rounded-xl transition-colors"
                    >
                      Ver Clube →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TELA 2: VISÃO E DETALHES DO CLUBE SELECIONADO */}
      {viewMode === 'detail' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToList}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <span>← Voltar para lista de clubes</span>
            </button>

            {/* Menu Dropdown de Seleção Rápida entre Clubes */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Alternar Clube:</span>
              <select
                value={selectedClubId || ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  if (id) handleSelectClub(id);
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-1.5 focus:outline-none"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.acronym})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingClubDetails || !selectedClub ? (
            <LoadingSkeleton type="card" count={3} />
          ) : (
            <>
              {/* Cabeçalho do Clube */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-white">
                      {selectedClub.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded text-xs bg-slate-800 font-mono font-bold text-emerald-400 border border-slate-700">
                      {selectedClub.acronym}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Elenco Atual:{' '}
                    <strong className="text-slate-200">
                      {selectedClub.players.length} de 12 jogadores
                    </strong>
                  </p>
                </div>
              </div>

              {/* Cards de Métricas Financeiras */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Caixa Disponível
                  </span>
                  <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
                    R$ {formatCurrency(selectedClub.cash)}
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Valor do Elenco
                  </span>
                  <div className="text-xl font-bold text-white mt-1 font-mono">
                    R$ {formatCurrency(selectedClub.squad_value)}
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Patrimônio Líquido
                  </span>
                  <div className="text-xl font-bold text-teal-300 mt-1 font-mono">
                    R$ {formatCurrency(selectedClub.net_worth)}
                  </div>
                </div>
              </div>

              {/* Navegação por Abas (Elenco x Escalação x Histórico) */}
              <div className="flex border-b border-slate-800 space-x-6">
                <button
                  onClick={() => setActiveTab('elenco')}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'elenco'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Elenco ({selectedClub.players.length}/12)
                </button>

                <button
                  onClick={() => setActiveTab('escalacao')}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'escalacao'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Escalação Tática
                </button>

                <button
                  onClick={() => setActiveTab('historico')}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'historico'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Histórico de Transações
                </button>
              </div>

              {/* ABA 1: ELENCO */}
              {activeTab === 'elenco' &&
                (selectedClub.players.length === 0 ? (
                  <EmptyState
                    title="Nenhum jogador no elenco"
                    description="Acesse o módulo de Mercado para comprar novos atletas para este clube."
                  />
                ) : (
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                          <tr>
                            <th className="px-4 py-3">Atleta</th>
                            <th className="px-4 py-3">Posição</th>
                            <th className="px-4 py-3 text-center">Overall</th>
                            <th className="px-4 py-3 text-right">
                              Valor de Mercado
                            </th>
                            <th className="px-4 py-3 text-right">Valor Pago</th>
                            <th className="px-4 py-3 text-center">
                              Dias Restantes
                            </th>
                            <th className="px-4 py-3 text-center">% Multa</th>
                            <th className="px-4 py-3 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {selectedClub.players.map((p) => {
                            const contract = p.contract;
                            const rawPlayer = p as unknown as Record<
                              string,
                              unknown
                            >;
                            const purchaseVal =
                              contract?.purchase_value ??
                              (rawPlayer.purchase_value as number);
                            const remDays =
                              contract?.remaining_days ??
                              (rawPlayer.remaining_days as number) ??
                              0;
                            const penRate =
                              contract?.penalty_rate ??
                              (rawPlayer.penalty_rate as number) ??
                              0;

                            return (
                              <tr
                                key={p.id}
                                className="hover:bg-slate-800/30 transition-colors"
                              >
                                <td className="px-4 py-3 font-semibold text-white">
                                  {p.name}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded text-xs bg-slate-800 font-mono font-bold text-slate-300 border border-slate-700">
                                    {p.position}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-emerald-400">
                                  {p.overall}
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-white">
                                  R$ {formatCurrency(p.market_value)}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-xs text-slate-400">
                                  {purchaseVal !== undefined
                                    ? `R$ ${formatCurrency(purchaseVal)}`
                                    : '–'}
                                </td>
                                <td className="px-4 py-3 text-center font-mono text-xs text-amber-300">
                                  {remDays} dias
                                </td>
                                <td className="px-4 py-3 text-center font-mono text-xs text-rose-400">
                                  {penRate}%
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => setSelectedSellPlayer(p)}
                                    className="px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/40 rounded text-xs font-semibold"
                                  >
                                    Vender
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

              {/* ABA 2: ESCALAÇÃO TÁTICA */}
              {activeTab === 'escalacao' && (
                <LineupSection
                  club={selectedClub}
                  onLineupUpdated={() => fetchClubDetails(selectedClub.id)}
                />
              )}

              {/* ABA 3: HISTÓRICO DE TRANSAÇÕES */}
              {activeTab === 'historico' && (
                <div className="space-y-4">
                  {/* Dashboard Resumo Financeiro */}
                  {summary && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Total Gasto (Compras)
                        </span>
                        <div className="text-lg font-bold text-rose-400 mt-1 font-mono">
                          R$ {formatCurrency(summary.total_spent)}
                        </div>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Total Recebido (Vendas)
                        </span>
                        <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">
                          R$ {formatCurrency(summary.total_received)}
                        </div>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Taxas / Comissões
                        </span>
                        <div className="text-lg font-bold text-amber-400 mt-1 font-mono">
                          R$ {formatCurrency(summary.total_fees)}
                        </div>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Multas Pagas
                        </span>
                        <div className="text-lg font-bold text-rose-400 mt-1 font-mono">
                          R$ {formatCurrency(summary.total_penalties)}
                        </div>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 col-span-2 lg:col-span-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Lucro Líquido
                        </span>
                        <div
                          className={`text-lg font-bold mt-1 font-mono ${
                            summary.total_profit >= 0
                              ? 'text-teal-300'
                              : 'text-rose-400'
                          }`}
                        >
                          R$ {formatCurrency(summary.total_profit)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Filtros e Exportar CSV */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Filtrar por atleta..."
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />

                      <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                        {TYPE_OPTIONS.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setTypeFilter(type.value)}
                            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
                              typeFilter === type.value
                                ? 'bg-slate-900 text-emerald-400 shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleExportCSV}
                          disabled={!filteredTransactions.length}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-xs rounded-xl transition-colors disabled:opacity-40"
                        >
                          📥 Exportar CSV
                        </button>
                      </div>
                    </div>
                  </div>

                  {loadingHistory ? (
                    <LoadingSkeleton type="table" count={4} />
                  ) : filteredTransactions.length === 0 ? (
                    <EmptyState
                      title="Nenhuma transação registrada"
                      description="As compras e vendas realizadas por este clube aparecerão detalhadas aqui."
                    />
                  ) : (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                            <tr>
                              <th className="px-4 py-3">Data / Hora</th>
                              <th className="px-4 py-3">Atleta</th>
                              <th className="px-4 py-3 text-center">
                                Operação
                              </th>
                              <th className="px-4 py-3 text-right">
                                Valor Operação
                              </th>
                              <th className="px-4 py-3 text-right">
                                Taxa (5%)
                              </th>
                              <th className="px-4 py-3 text-right">Multa</th>
                              <th className="px-4 py-3 text-right">
                                Variação Caixa
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {filteredTransactions.map((t) => (
                              <tr
                                key={t.id}
                                className="hover:bg-slate-800/30 transition-colors"
                              >
                                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                                  {formatDateTime(t.created_at)}
                                </td>
                                <td className="px-4 py-3 font-semibold text-white">
                                  {t.player_name}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {t.type === 'COMPRA' ? (
                                    <span className="px-2 py-0.5 rounded text-[11px] bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                                      COMPRA
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                                      VENDA
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-xs text-slate-200">
                                  R$ {formatCurrency(t.value)}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-xs text-amber-400">
                                  R$ {formatCurrency(t.fee)}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-xs text-rose-400">
                                  R$ {formatCurrency(t.penalty)}
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold">
                                  <span
                                    className={
                                      t.cash_change >= 0
                                        ? 'text-emerald-400'
                                        : 'text-rose-400'
                                    }
                                  >
                                    R$ {formatCashChange(t.cash_change)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <CreateClubModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchClubs}
      />

      <SellPlayerModal
        player={selectedSellPlayer}
        onClose={() => setSelectedSellPlayer(null)}
        onSuccess={() => selectedClubId && fetchClubDetails(selectedClubId)}
      />
    </div>
  );
};
