import React, { useState, useEffect, useCallback } from 'react';
import { leagueService } from '../../services/leagueService';
import { clubService } from '../../services/clubService';
import type { Standing, Match, Club } from '../../types';
import { formatDateTime } from '../../utils/formatters';

import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { AlertBanner } from '../../components/shared/AlertBanner';
import { EmptyState } from '../../components/shared/EmptyState';

import { SimulateMatchModal } from './components/SimulateMatchModal';
import { MatchDetailModal } from './components/MatchDetailModal';

export const LeaguePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'classificacao' | 'partidas'>(
    'classificacao'
  );
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const fetchLeagueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [standingsData, matchesData, clubsData] = await Promise.all([
        leagueService.getStandings(),
        leagueService.getMatches(),
        clubService.getClubs(),
      ]);

      setStandings(Array.isArray(standingsData) ? standingsData : []);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setClubs(Array.isArray(clubsData) ? clubsData : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar dados da liga.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const load = async () => {
      await Promise.resolve();
      if (isSubscribed) {
        fetchLeagueData();
      }
    };

    load();

    return () => {
      isSubscribed = false;
    };
  }, [fetchLeagueData]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Liga PASSE</h1>
          <p className="text-sm text-slate-400">
            Acompanhe a Tabela de Classificação e simule os confrontos do
            campeonato.
          </p>
        </div>

        {clubs.length >= 2 && (
          <button
            onClick={() => setIsSimulateOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-900/20 flex items-center space-x-2"
          >
            <span>⚽</span>
            <span>Simular Partida</span>
          </button>
        )}
      </div>

      {error && <AlertBanner message={error} onRetry={fetchLeagueData} />}

      {/* Navegação por Abas */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('classificacao')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'classificacao'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Tabela de Classificação
        </button>

        <button
          onClick={() => setActiveTab('partidas')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'partidas'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Histórico de Partidas ({matches.length})
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : activeTab === 'classificacao' ? (
        standings.length === 0 ? (
          <EmptyState
            title="Nenhum clube na tabela"
            description="Cadastre clubes e realize partidas para gerar a classificação do campeonato."
          />
        ) : (
          /* Tabela de Classificação */
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">Pos</th>
                    <th className="px-4 py-3">Clube</th>
                    <th className="px-4 py-3 text-center font-bold text-white">
                      PTS
                    </th>
                    <th className="px-4 py-3 text-center">J</th>
                    <th className="px-4 py-3 text-center text-emerald-400">
                      V
                    </th>
                    <th className="px-4 py-3 text-center text-amber-400">E</th>
                    <th className="px-4 py-3 text-center text-rose-400">D</th>
                    <th className="px-4 py-3 text-center">GP</th>
                    <th className="px-4 py-3 text-center">GC</th>
                    <th className="px-4 py-3 text-center font-bold">SG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {standings.map((s, index) => (
                    <tr
                      key={s.club_id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        index === 0 ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-center font-bold text-slate-400">
                        {s.position || index + 1}º
                      </td>
                      <td className="px-4 py-3 font-sans font-semibold text-white">
                        {s.club_name}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-400 text-sm">
                        {s.points}
                      </td>
                      <td className="px-4 py-3 text-center">{s.played}</td>
                      <td className="px-4 py-3 text-center text-emerald-300 font-semibold">
                        {s.wins}
                      </td>
                      <td className="px-4 py-3 text-center text-amber-300">
                        {s.draws}
                      </td>
                      <td className="px-4 py-3 text-center text-rose-300">
                        {s.losses}
                      </td>
                      <td className="px-4 py-3 text-center">{s.goals_for}</td>
                      <td className="px-4 py-3 text-center">
                        {s.goals_against}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-white">
                        {s.goal_difference > 0
                          ? `+${s.goal_difference}`
                          : s.goal_difference}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : matches.length === 0 ? (
        <EmptyState
          title="Nenhuma partida realizada"
          description="Clique em 'Simular Partida' para realizar o primeiro jogo da temporada."
          actionLabel="Simular Partida"
          onAction={() => setIsSimulateOpen(true)}
        />
      ) : (
        /* Lista de Partidas Realizadas */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl hover:border-slate-700 transition-colors"
            >
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>{formatDateTime(m.played_at)}</span>
                <span className="uppercase tracking-wider">
                  Partida #{m.id}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-y border-slate-800">
                <div className="flex-1 text-right font-semibold text-sm text-white pr-3">
                  {m.home.club_name}
                </div>

                <div className="px-4 py-1 bg-slate-800 rounded-lg font-mono text-lg font-bold text-white border border-slate-700 flex items-center space-x-2">
                  <span
                    className={
                      m.home.goals > m.away.goals ? 'text-emerald-400' : ''
                    }
                  >
                    {m.home.goals}
                  </span>
                  <span className="text-slate-500 text-xs">-</span>
                  <span
                    className={
                      m.away.goals > m.home.goals ? 'text-emerald-400' : ''
                    }
                  >
                    {m.away.goals}
                  </span>
                </div>

                <div className="flex-1 text-left font-semibold text-sm text-white pl-3">
                  {m.away.club_name}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setSelectedMatchId(m.id)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center space-x-1"
                >
                  <span>Ver Súmula Detalhada</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      <SimulateMatchModal
        isOpen={isSimulateOpen}
        clubs={clubs}
        onClose={() => setIsSimulateOpen(false)}
        onSuccess={(newMatch) => {
          fetchLeagueData();
          setSelectedMatchId(newMatch.id);
        }}
      />

      <MatchDetailModal
        matchId={selectedMatchId}
        onClose={() => setSelectedMatchId(null)}
      />
    </div>
  );
};
