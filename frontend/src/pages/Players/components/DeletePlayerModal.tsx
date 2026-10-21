import React, { useState } from 'react';
import { playerService } from '../../../services/playerService';
import type { Player } from '../../../types';

interface DeletePlayerModalProps {
  player: Player | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeletePlayerModal: React.FC<DeletePlayerModalProps> = ({
  player,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!player) return null;

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await playerService.deletePlayer(player.id);
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao excluir jogador.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Excluir Jogador</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-300">
            Tem certeza que deseja excluir o atleta{' '}
            <strong className="text-emerald-400">{player.name}</strong>?
          </p>

          <p className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
            ℹ️ Apenas jogadores livres podem ser excluídos (exclusão lógica). O
            atleta sairá da lista, mas seu histórico de partidas e transações
            antigas será mantido no sistema.
          </p>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-rose-900/20 disabled:opacity-50"
            >
              {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
