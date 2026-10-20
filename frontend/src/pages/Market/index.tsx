import React, { useState, useEffect, useCallback } from 'react';
import { playerService } from '../../services/playerService';
import { clubService } from '../../services/clubService';
import { useAppStore } from '../../store/useAppStore';
import type { Player, Position, ClubWithSquad } from '../../types';
import { formatCurrency } from '../../utils/formatters';

import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { AlertBanner } from '../../components/shared/AlertBanner';
import { EmptyState } from '../../components/shared/EmptyState';
import { BuyPlayerModal } from '../Players/components/BuyPlayerModal';

export const MarketPage: React.FC = () => {
  const { selectedClubId, clubs } = useAppStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeClub, setActiveClub] = useState<ClubWithSquad | null>(null);

  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<Position | ''>('');
  const [onlyFree, setOnlyFree] = useState(true);
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuyPlayer, setSelectedBuyPlayer] = useState<Player | null>(
    null
  );

  const fetchMarketPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await playerService.getPlayers({
        search: search || undefined,
        position: position || undefined,
        free: onlyFree || undefined,
        max_value: maxPrice !== '' ? Number(maxPrice) : undefined,
        limit: 20,
      });

      setPlayers(response.data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar o mercado de transferências.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, position, onlyFree, maxPrice]);

  useEffect(() => {
    let isSubscribed = true;

    const load = async () => {
      await Promise.resolve();
      if (isSubscribed) {
        fetchMarketPlayers();
      }
    };

    load();

    return () => {
      isSubscribed = false;
    };
  }, [fetchMarketPlayers]);

  useEffect(() => {
    let isSubscribed = true;

    const loadClub = async () => {
      if (!selectedClubId) return;
      try {
        const data = await clubService.getClubById(selectedClubId);
        if (isSubscribed) {
          setActiveClub(data);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do clube ativo:', err);
      }
    };

    loadClub();

    return () => {
      isSubscribed = false;
    };
  }, [selectedClubId]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Mercado de Transferências
          </h1>
          <p className="text-sm text-slate-400">
            Encontre atletas disponíveis e reforce o elenco do seu clube.
          </p>
        </div>

        {activeClub && (
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center space-x-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Clube Comprador
              </span>
              <span className="font-semibold text-sm text-white">
                {activeClub.name}
              </span>
            </div>
            <div className="pl-4 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Saldo Disponível
              </span>
              <span className="font-bold text-sm text-emerald-400">
                R$ {formatCurrency(activeClub.cash)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filtros do Mercado */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Buscar por nome do atleta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />

          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as Position | '')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="">Todas as Posições</option>
            <option value="GOL">Goleiro (GOL)</option>
            <option value="ZAG">Zagueiro (ZAG)</option>
            <option value="LAT">Lateral (LAT)</option>
            <option value="MEI">Meio-Campo (MEI)</option>
            <option value="ATA">Atacante (ATA)</option>
          </select>

          <input
            type="number"
            placeholder="Valor máx. de mercado (R$)"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(e.target.value !== '' ? Number(e.target.value) : '')
            }
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />

          <label className="flex items-center px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
            <input
              type="checkbox"
              checked={onlyFree}
              onChange={(e) => setOnlyFree(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 mr-2"
            />
            <span className="text-xs font-semibold text-slate-200">
              Apenas Jogadores Sem Clube
            </span>
          </label>
        </div>
      </div>

      {error && <AlertBanner message={error} onRetry={fetchMarketPlayers} />}

      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : players.length === 0 ? (
        <EmptyState
          title="Nenhum jogador encontrado no mercado"
          description="Tente ajustar os filtros de busca ou preço máximo para visualizar mais opções."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p) => {
            const club = clubs.find((c) => c.id === p.club_id);
            const isFree = p.club_id === null;

            return (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.age} anos • Agilidade: {p.agility}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-800 font-mono font-bold text-emerald-400 border border-slate-700">
                      {p.position}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Overall
                      </span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {p.overall}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Situação
                      </span>
                      <span className="font-semibold text-slate-200">
                        {isFree
                          ? 'Livre (Sem Clube)'
                          : club?.acronym || 'Sob Contrato'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Valor de Mercado
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      R$ {formatCurrency(p.market_value)}
                    </span>
                  </div>

                  {isFree ? (
                    <button
                      onClick={() => setSelectedBuyPlayer(p)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                    >
                      Comprar
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Com clube
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Compra */}
      <BuyPlayerModal
        player={selectedBuyPlayer}
        onClose={() => setSelectedBuyPlayer(null)}
        onSuccess={() => {
          fetchMarketPlayers();
          if (selectedClubId) {
            clubService
              .getClubById(selectedClubId)
              .then(setActiveClub)
              .catch(console.error);
          }
        }}
      />
    </div>
  );
};
