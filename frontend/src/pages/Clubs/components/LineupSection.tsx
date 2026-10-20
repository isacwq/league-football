import React, { useState, useEffect } from 'react';
import { clubService } from '../../../services/clubService';
import type { ClubWithSquad, Formation, Lineup } from '../../../types';

interface LineupSectionProps {
  club: ClubWithSquad;
  onLineupUpdated: () => void;
}

export const LineupSection: React.FC<LineupSectionProps> = ({
  club,
  onLineupUpdated,
}) => {
  const [lineup, setLineup] = useState<Lineup | null>(null);
  const [formation, setFormation] = useState<Formation>('2-1-1');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const loadLineup = async () => {
      try {
        setLoading(true);
        const data = await clubService.getLineup(club.id);
        if (isSubscribed) {
          setLineup(data);
          if (data.formation) setFormation(data.formation);
          if (data.players) setSelectedPlayerIds(data.players.map((p) => p.id));
        }
      } catch (err) {
        console.error('Erro ao carregar escalação:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    loadLineup();

    return () => {
      isSubscribed = false;
    };
  }, [club.id]);

  const handleTogglePlayer = (playerId: number) => {
    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(selectedPlayerIds.filter((id) => id !== playerId));
    } else {
      if (selectedPlayerIds.length >= 5) {
        alert('Você já selecionou os 5 titulares.');
        return;
      }
      setSelectedPlayerIds([...selectedPlayerIds, playerId]);
    }
  };

  const handleSaveLineup = async () => {
    if (selectedPlayerIds.length !== 5) {
      setError('A escalação precisa ter exatamente 5 titulares.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await clubService.updateLineup(club.id, {
        formation,
        player_ids: selectedPlayerIds,
      });

      setLineup(response);
      setSuccessMessage('Escalação salva com sucesso!');
      onLineupUpdated();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar escalação.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-400">
        Carregando escalação...
      </div>
    );
  }

  const isComplete = lineup?.complete ?? false;

  return (
    <div className="space-y-6">
      {/* Status da Escalação */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          isComplete
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">{isComplete ? '✅' : '⚠️'}</span>
          <div>
            <h3 className="text-sm font-bold">
              Escalação {isComplete ? 'Completa' : 'Incompleta'}
            </h3>
            <p className="text-xs text-slate-400">
              {isComplete
                ? 'O clube está apto para disputar partidas na Liga.'
                : 'Escale 5 titulares (1 GOL e 4 de linha) para poder jogar partidas.'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
          {successMessage}
        </div>
      )}

      {/* Seleção de Formação Tática */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Formação Tática
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['3-1', '2-2', '2-1-1', '1-2-1'] as Formation[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormation(f)}
              className={`p-3 rounded-lg border text-center font-bold text-sm transition-colors ${
                formation === f
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Seleção dos 5 Titulares no Elenco */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white">
            Selecione os 5 Titulares ({selectedPlayerIds.length}/5)
          </h3>
          <span className="text-xs text-slate-400">
            Atletas indisponíveis doentes não podem ser escalados.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {club.players.map((p) => {
            const isSelected = selectedPlayerIds.includes(p.id);
            const isSick = p.condition === 'DOENTE';

            return (
              <div
                key={p.id}
                onClick={() => !isSick && handleTogglePlayer(p.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSick
                    ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    : isSelected
                      ? 'bg-emerald-600/10 border-emerald-500 text-white'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm">{p.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 font-mono font-bold text-slate-300 border border-slate-700">
                      {p.position}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Overall:{' '}
                    <strong className="text-emerald-400">{p.overall}</strong>
                  </div>
                </div>

                <div>
                  {isSick ? (
                    <span className="text-[10px] text-rose-400 font-semibold">
                      Doente
                    </span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="accent-emerald-500 w-4 h-4"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveLineup}
          disabled={saving || selectedPlayerIds.length !== 5}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Escalação'}
        </button>
      </div>
    </div>
  );
};
