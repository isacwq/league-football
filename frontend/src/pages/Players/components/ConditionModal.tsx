import React, { useState } from 'react';
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
  const [condition, setCondition] = useState<Condition>(
    player?.condition || 'APTO'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!player) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        <h2 className="text-lg font-bold text-white mb-2">
          Alterar Condição Física
        </h2>
        <p className="text-xs text-slate-400 mb-4">
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
              Nova Condição
            </label>
            <div className="space-y-2">
              {[
                { value: 'APTO', label: 'Apto (0% desconto)' },
                {
                  value: 'MAL_CONDICIONADO',
                  label: 'Mal Condicionado (15% desconto)',
                },
                { value: 'DOENTE', label: 'Doente (30% desconto)' },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
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
                    className="mr-3 accent-emerald-500"
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg"
            >
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
