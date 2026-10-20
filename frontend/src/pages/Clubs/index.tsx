import React, { useState, useEffect, useCallback } from 'react';
import { clubService } from '../../services/clubService';
import { useAppStore } from '../../store/useAppStore';
import type { Club, ClubWithSquad, Player } from '../../types';
import { formatCurrency } from '../../utils/formatters';

import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { AlertBanner } from '../../components/shared/AlertBanner';
import { EmptyState } from '../../components/shared/EmptyState';

import { CreateClubModal } from './components/CreateClubModal';
import { SellPlayerModal } from './components/SellPlayerModal';
import { LineupSection } from './components/LineupSection';

type ClubSortOption = 'name' | 'net_worth_desc' | 'net_worth_asc';

export const ClubsPage: React.FC = () => {
  const { selectedClubId, setSelectedClubId } = useAppStore();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<ClubWithSquad | null>(null);
  const [activeTab, setActiveTab] = useState<'elenco' | 'escalacao'>('elenco');
  const [sort, setSort] = useState<ClubSortOption>('name');

  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingClubDetails, setLoadingClubDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSellPlayer, setSelectedSellPlayer] = useState<Player | null>(
    null
  );

  const fetchClubs = useCallback(async () => {
    try {
      setLoadingClubs(true);
      setError(null);
      const data = await clubService.getClubs();

      const sortedClubs = [...data].sort((a, b) => {
        if (sort === 'net_worth_desc') return b.net_worth - a.net_worth;
        if (sort === 'net_worth_asc') return a.net_worth - b.net_worth;
        return a.name.localeCompare(b.name);
      });

      setClubs(sortedClubs);

      if (sortedClubs.length > 0 && !selectedClubId) {
        setSelectedClubId(sortedClubs[0].id);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar lista de clubes.';
      setError(message);
    } finally {
      setLoadingClubs(false);
    }
  }, [selectedClubId, setSelectedClubId, sort]);

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

  useEffect(() => {
    let isSubscribed = true;

    const load = async () => {
      await Promise.resolve();
      if (isSubscribed) {
        fetchClubs();
      }
    };

    load();

    return () => {
      isSubscribed = false;
    };
  }, [fetchClubs]);

  useEffect(() => {
    let isSubscribed = true;

    const loadDetails = async () => {
      await Promise.resolve();
      if (isSubscribed && selectedClubId) {
        fetchClubDetails(selectedClubId);
      }
    };

    loadDetails();

    return () => {
      isSubscribed = false;
    };
  }, [selectedClubId, fetchClubDetails]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Visão do Clube</h1>
          <p className="text-sm text-slate-400">
            Acompanhe a situação financeira, contratos do elenco e prancheta de
            escalação.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
        >
          + Novo Clube
        </button>
      </div>

      {error && <AlertBanner message={error} onRetry={fetchClubs} />}

      {loadingClubs ? (
        <LoadingSkeleton type="card" count={3} />
      ) : clubs.length === 0 ? (
        <EmptyState
          title="Nenhum clube cadastrado"
          description="Crie o primeiro clube da liga para começar as contratações."
          actionLabel="Criar Primeiro Clube"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menu Lateral com a Lista dos Clubes */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Clubes ({clubs.length}/20)
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ClubSortOption)}
                className="bg-slate-800 border border-slate-700 rounded text-[11px] text-slate-300 px-2 py-1"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="net_worth_desc">Maior Patrimônio</option>
                <option value="net_worth_asc">Menor Patrimônio</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {clubs.map((c) => {
                const isSelected = c.id === selectedClubId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClubId(c.id)}
                    className={`w-full p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 text-white'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{c.name}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {c.acronym}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                      <span>Patrimônio:</span>
                      <span className="font-mono text-slate-300">
                        R$ {formatCurrency(c.net_worth)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Painel do Clube Selecionado */}
          <div className="lg:col-span-3 space-y-6">
            {loadingClubDetails || !selectedClub ? (
              <LoadingSkeleton type="table" count={4} />
            ) : (
              <>
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

                {/* Navegação entre Abas (Elenco x Escalação) */}
                <div className="flex border-b border-slate-800 space-x-4">
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
                </div>

                {/* Conteúdo da Aba Ativa */}
                {activeTab === 'elenco' ? (
                  selectedClub.players.length === 0 ? (
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
                              <th className="px-4 py-3 text-right">
                                Valor Pago
                              </th>
                              <th className="px-4 py-3 text-center">
                                Dias Restantes
                              </th>
                              <th className="px-4 py-3 text-center">% Multa</th>
                              <th className="px-4 py-3 text-center">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {selectedClub.players.map((p) => (
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
                                  R${' '}
                                  {formatCurrency(p.contract?.purchase_value)}
                                </td>
                                <td className="px-4 py-3 text-center font-mono text-xs text-amber-300">
                                  {p.contract?.remaining_days ?? 0} dias
                                </td>
                                <td className="px-4 py-3 text-center font-mono text-xs text-rose-400">
                                  {p.contract?.penalty_rate ?? 0}%
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
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                ) : (
                  <LineupSection
                    club={selectedClub}
                    onLineupUpdated={() => fetchClubDetails(selectedClub.id)}
                  />
                )}
              </>
            )}
          </div>
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
