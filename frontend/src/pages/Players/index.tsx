import React, { useState, useEffect, useCallback } from 'react';
import { playerService } from '../../services/playerService';
import { clubService } from '../../services/clubService';
import type { Player, Position, Condition, Club } from '../../types';
import { formatCurrency } from '../../utils/formatters';

import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { AlertBanner } from '../../components/shared/AlertBanner';
import { EmptyState } from '../../components/shared/EmptyState';

import { CreatePlayerModal } from './components/CreatePlayerModal';
import { ConditionModal } from './components/ConditionModal';
import { BuyPlayerModal } from './components/BuyPlayerModal';

export const PlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<Position | ''>('');
  const [condition, setCondition] = useState<Condition | ''>('');
  const [onlyFree, setOnlyFree] = useState(false);
  const [clubId, setClubId] = useState<number | ''>('');
  const [sort, setSort] = useState('name');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedConditionPlayer, setSelectedConditionPlayer] =
    useState<Player | null>(null);
  const [selectedBuyPlayer, setSelectedBuyPlayer] = useState<Player | null>(
    null
  );

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await playerService.getPlayers({
        search: search || undefined,
        position: position || undefined,
        condition: condition || undefined,
        free: onlyFree || undefined,
        club_id: clubId !== '' ? Number(clubId) : undefined,
        sort,
        page,
        limit: 10,
      });

      setPlayers(response.data);
      setTotalPages(response.meta.total_pages);
      setTotalItems(response.meta.total_items);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar a lista de jogadores.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, position, condition, onlyFree, clubId, sort, page]);

  useEffect(() => {
    let isSubscribed = true;

    const loadData = async () => {
      await Promise.resolve();
      if (isSubscribed) {
        fetchPlayers();
      }
    };

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [fetchPlayers]);

  useEffect(() => {
    let isSubscribed = true;

    const loadClubs = async () => {
      try {
        const data = await clubService.getClubs();
        if (isSubscribed) {
          setClubs(data);
        }
      } catch (err) {
        console.error('Erro ao carregar lista de clubes:', err);
      }
    };

    loadClubs();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleDelete = async (player: Player) => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir o jogador ${player.name}?`
      )
    )
      return;
    try {
      await playerService.deletePlayer(player.id);
      fetchPlayers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao excluir jogador.';
      alert(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Jogadores</h1>
          <p className="text-sm text-slate-400">
            Cadastre jogadores, acompanhe os indicadores e compre os que estão
            livres.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
        >
          + Novo Jogador
        </button>
      </div>

      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />

          <select
            value={position}
            onChange={(e) => {
              setPosition(e.target.value as Position | '');
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="">Todas as Posições</option>
            <option value="GOL">Goleiro (GOL)</option>
            <option value="ZAG">Zagueiro (ZAG)</option>
            <option value="LAT">Lateral (LAT)</option>
            <option value="MEI">Meio-Campo (MEI)</option>
            <option value="ATA">Atacante (ATA)</option>
          </select>

          <select
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value as Condition | '');
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="">Todas as Condições</option>
            <option value="APTO">Apto</option>
            <option value="MAL_CONDICIONADO">Mal Condicionado</option>
            <option value="DOENTE">Doente</option>
          </select>

          <select
            value={onlyFree ? 'free' : clubId}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'free') {
                setOnlyFree(true);
                setClubId('');
              } else {
                setOnlyFree(false);
                setClubId(val !== '' ? Number(val) : '');
              }
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="">Todos os Vínculos</option>
            <option value="free">Apenas Livres</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="name">Ordenar por Nome</option>
            <option value="value_desc">Maior Valor de Mercado</option>
            <option value="value_asc">Menor Valor de Mercado</option>
            <option value="age_desc">Mais Velho</option>
            <option value="age_asc">Mais Jovem</option>
            <option value="position">Posição (GOL → ATA)</option>
          </select>
        </div>
      </div>

      {error && <AlertBanner message={error} onRetry={fetchPlayers} />}

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : players.length === 0 ? (
        <EmptyState
          title="Nenhum jogador encontrado"
          description="Tente ajustar os filtros ou cadastrar um novo atleta no sistema."
          actionLabel="Cadastrar Jogador"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Jogador</th>
                  <th className="px-4 py-3">Posição</th>
                  <th className="px-4 py-3 text-center">Overall</th>
                  <th className="px-4 py-3 text-center">Agilidade</th>
                  <th className="px-4 py-3 text-center">Idade</th>
                  <th className="px-4 py-3">Condição</th>
                  <th className="px-4 py-3 text-right">Valor Base</th>
                  <th className="px-4 py-3 text-right">Valor de Mercado</th>
                  <th className="px-4 py-3">Clube</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {players.map((p) => {
                  const club = clubs.find((c) => c.id === p.club_id);
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
                      <td className="px-4 py-3 text-center">{p.agility}</td>
                      <td className="px-4 py-3 text-center">{p.age}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedConditionPlayer(p)}
                          className="hover:opacity-80 cursor-pointer"
                        >
                          {p.condition === 'APTO' && (
                            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                              • Apto
                            </span>
                          )}
                          {p.condition === 'MAL_CONDICIONADO' && (
                            <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                              • Mal condicionado
                            </span>
                          )}
                          {p.condition === 'DOENTE' && (
                            <span className="px-2 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium">
                              • Doente
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        R$ {formatCurrency(p.base_value)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-white">
                        R$ {formatCurrency(p.market_value)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {club ? (
                          <span className="text-slate-200 font-medium">
                            {club.acronym}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Livre</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        {p.club_id === null ? (
                          <>
                            <button
                              onClick={() => setSelectedBuyPlayer(p)}
                              className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 rounded text-xs font-semibold"
                            >
                              Comprar
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              className="px-2.5 py-1 bg-rose-600/10 text-rose-400 hover:bg-rose-600/30 rounded text-xs font-medium"
                            >
                              Excluir
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500 italic">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              {' '}
              Mostrando {(page - 1) * 10 + 1}-{Math.min(page * 10, totalItems)}{' '}
              de {totalItems} jogadores{' '}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-3 py-1.5 font-semibold text-white">
                {' '}
                Página {page} de {totalPages}{' '}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      )}
      <CreatePlayerModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchPlayers}
      />

      <ConditionModal
        player={selectedConditionPlayer}
        onClose={() => setSelectedConditionPlayer(null)}
        onSuccess={fetchPlayers}
      />

      <BuyPlayerModal
        player={selectedBuyPlayer}
        onClose={() => setSelectedBuyPlayer(null)}
        onSuccess={fetchPlayers}
      />
    </div>
  );
};
