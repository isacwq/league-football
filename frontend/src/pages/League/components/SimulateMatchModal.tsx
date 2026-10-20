import React, { useState, useEffect } from 'react';
import { leagueService } from '../../../services/leagueService';
import type { Club, Match } from '../../../types';

interface SimulateMatchModalProps {
  isOpen: boolean;
  clubs: Club[];
  onClose: () => void;
  onSuccess: (match: Match) => void;
}

export const SimulateMatchModal: React.FC<SimulateMatchModalProps> = ({
  isOpen,
  clubs,
  onClose,
  onSuccess,
}) => {
  const [homeClubId, setHomeClubId] = useState<number>(0);
  const [awayClubId, setAwayClubId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const initClubs = async () => {
      await Promise.resolve();
      if (isSubscribed && clubs && clubs.length > 0) {
        setHomeClubId(clubs[0].id);
        setAwayClubId(clubs.length > 1 ? clubs[1].id : clubs[0].id);
      }
    };

    initClubs();

    return () => {
      isSubscribed = false;
    };
  }, [clubs, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!homeClubId || !awayClubId) {
      setError('Selecione ambos os clubes para simular a partida.');
      return;
    }

    if (homeClubId === awayClubId) {
      setError('O clube mandante e o visitante não podem ser o mesmo.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const matchResult = await leagueService.createMatch({
        home_club_id: homeClubId,
        away_club_id: awayClubId,
      });

      onSuccess(matchResult);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível simular a partida.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Simular Partida</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Clube Mandante (Casa)
            </label>
            <select
              value={homeClubId}
              onChange={(e) => setHomeClubId(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.acronym})
                </option>
              ))}
            </select>
          </div>

          <div className="text-center font-bold text-slate-500 text-sm">VS</div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Clube Visitante (Fora)
            </label>
            <select
              value={awayClubId}
              onChange={(e) => setAwayClubId(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.acronym})
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
            ℹ️ Ambos os clubes precisam ter exatamente **5 titulares escalados e
            sem atletas doentes** para disputar o jogo.
          </p>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {loading ? 'Simulando...' : 'Iniciar Confronto ⚽'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
