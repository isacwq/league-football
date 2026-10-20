import React, { useState, useEffect } from 'react';
import { leagueService } from '../../../services/leagueService';
import type { Match } from '../../../types';
import { formatDateTime } from '../../../utils/formatters';

interface MatchDetailModalProps {
  matchId: number | null;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  matchId,
  onClose,
}) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const loadMatch = async () => {
      if (!matchId) return;
      try {
        setLoading(true);
        setError(null);
        await Promise.resolve();
        const data = await leagueService.getMatchById(matchId);
        if (isSubscribed) {
          setMatch(data);
        }
      } catch (err) {
        if (isSubscribed) {
          const message =
            err instanceof Error
              ? err.message
              : 'Erro ao carregar súmula da partida.';
          setError(message);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    loadMatch();

    return () => {
      isSubscribed = false;
    };
  }, [matchId]);

  if (!matchId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-slate-100 my-8">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Súmula do Confronto</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse">
            Carregando detalhes dos duelos...
          </div>
        ) : error ? (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
            {error}
          </div>
        ) : match ? (
          <div className="mt-4 space-y-6">
            {/* Placar Principal */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 text-center relative overflow-hidden">
              <span className="text-[10px] text-slate-400 font-mono block mb-2">
                {formatDateTime(match.played_at)}
              </span>

              <div className="flex items-center justify-around">
                {/* Mandante */}
                <div className="flex-1 text-center">
                  <h3 className="font-bold text-lg text-white">
                    {match.home.club_name}
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">
                    Formação: {match.home.formation}
                  </span>
                </div>

                {/* Placar */}
                <div className="px-6 py-2 bg-slate-900 rounded-xl border border-slate-700 font-mono text-3xl font-black tracking-widest text-white shadow-inner flex items-center space-x-3">
                  <span
                    className={
                      match.home.goals > match.away.goals
                        ? 'text-emerald-400'
                        : 'text-white'
                    }
                  >
                    {match.home.goals}
                  </span>
                  <span className="text-slate-600 text-xl">x</span>
                  <span
                    className={
                      match.away.goals > match.home.goals
                        ? 'text-emerald-400'
                        : 'text-white'
                    }
                  >
                    {match.away.goals}
                  </span>
                </div>

                {/* Visitante */}
                <div className="flex-1 text-center">
                  <h3 className="font-bold text-lg text-white">
                    {match.away.club_name}
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">
                    Formação: {match.away.formation}
                  </span>
                </div>
              </div>
            </div>

            {/* Detalhamento dos 6 Duelos Táticos */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Série de Duelos (6 Lances)
              </h4>

              <div className="space-y-2">
                {match.duels?.map((duel) => {
                  const isHomeAttacking =
                    duel.attacking_club_id === match.home.club_id;
                  const attackingTeamName = isHomeAttacking
                    ? match.home.club_name
                    : match.away.club_name;

                  return (
                    <div
                      key={duel.order}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        duel.goal
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-bold px-2 py-1 bg-slate-800 rounded text-slate-400 border border-slate-700">
                          #{duel.order}
                        </span>
                        <div>
                          <p className="font-semibold text-white">
                            Ataque de{' '}
                            <span className="text-emerald-400">
                              {attackingTeamName}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            <span className="text-slate-200">
                              {duel.attacker.player_name}
                            </span>{' '}
                            ({duel.attacker.position}) vs{' '}
                            <span className="text-slate-200">
                              {duel.defender.player_name}
                            </span>{' '}
                            ({duel.defender.position})
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800 block mb-1">
                          Atributo: {duel.attacker.attribute.toUpperCase()} (
                          {duel.attacker.value} vs {duel.defender.value})
                        </span>
                        {duel.goal ? (
                          <span className="font-bold text-emerald-400 flex items-center justify-end space-x-1">
                            <span>⚽ GOL!</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">
                            Defendido
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl"
          >
            Fechar Súmula
          </button>
        </div>
      </div>
    </div>
  );
};
