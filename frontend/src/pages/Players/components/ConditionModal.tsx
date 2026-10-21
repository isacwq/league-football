import React, { useState, useEffect } from 'react';
import { playerService } from '../../../services/playerService';
import type { Player, Condition } from '../../../types';

interface ConditionModalProps {
  player: Player | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConditionModal: React.FC<ConditionModalProps> = ({
  player,
  onClose,
  onSuccess,
}) => {
  const [condition, setCondition] = useState<Condition>('APTO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const syncCondition = async () => {
      await Promise.resolve();
      if (isSubscribed && player) {
        setCondition(player.condition);
        setError(null);
      }
    };

    syncCondition();

    return () => {
      isSubscribed = false;
    };
  }, [player]);

  if (!player) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (player.condition === 'DOENTE' && condition === 'APTO') {
      setError(
        'Um jogador doente não pode passar diretamente para Apto. É necessário passar primeiro por Mal Condicionado.'
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await playerService.updateCondition(player.id, { condition });
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível alterar a condição.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            Alterar Condição Física
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400 my-3">
          Atleta:{' '}
          <span className="text-emerald-400 font-semibold">{player.name}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Nova Condição Física
            </label>
            <div className="space-y-2">
              {[
                {
                  value: 'APTO',
                  label: 'Apto',
                  desc: 'Desconto de 0% no valor de mercado. Pode jogar.',
                },
                {
                  value: 'MAL_CONDICIONADO',
                  label: 'Mal Condicionado',
                  desc: 'Desconto de 15% no valor de mercado. Sofre penalidade de -1 em duelos.',
                },
                {
                  value: 'DOENTE',
                  label: 'Doente',
                  desc: 'Desconto de 30% no valor de mercado. Não pode ser escalado.',
                },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`flex items-start p-3 rounded-xl border cursor-pointer transition-colors ${
                    condition === item.value
                      ? 'bg-slate-800 border-emerald-500 text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={item.value}
                    checked={condition === item.value}
                    onChange={(e) => setCondition(e.target.value as Condition)}
                    className="mt-1 mr-3 accent-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-semibold block text-slate-100">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {condition === 'DOENTE' && player.club_id && (
            <p className="text-xs text-rose-300 bg-rose-500/10 p-3 rounded-lg border border-rose-500/30">
              ⚠️ Atletas doentes são automaticamente desvinculados da escalação
              titular do clube.
            </p>
          )}

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-900/20"
            >
              {loading ? 'Salvando...' : 'Confirmar Alteração'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
