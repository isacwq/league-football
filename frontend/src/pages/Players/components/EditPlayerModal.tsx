import React, { useState } from 'react';
import { playerService } from '../../../services/playerService';
import type { Player, Position, UpdatePlayerDTO } from '../../../types';

interface EditPlayerModalProps {
  player: Player | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
  player,
  onClose,
  onSuccess,
}) => {
  const [prevPlayerId, setPrevPlayerId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UpdatePlayerDTO>({
    name: '',
    position: 'MEI',
    age: 20,
    agility: 50,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza o formulário durante a renderização quando o atleta selecionado mudar
  if (player && player.id !== prevPlayerId) {
    setPrevPlayerId(player.id);
    setFormData({
      name: player.name,
      position: player.position,
      age: player.age,
      agility: player.agility,
    });
    setError(null);
  }

  if (!player) return null;

  const isContractActive = player.club_id !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.age < player.age) {
      setError(
        `A idade não pode ser reduzida. A idade atual do atleta é ${player.age} anos.`
      );
      return;
    }

    if (formData.age >= 35 && formData.agility > 85) {
      setError(
        'Atletas com 35 anos ou mais possuem agilidade máxima permitida de 85.'
      );
      return;
    }

    try {
      setLoading(true);
      await playerService.updatePlayer(player.id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao atualizar dados do jogador.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Editar Jogador</h2>
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
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Posição
            </label>
            <select
              disabled={isContractActive}
              value={formData.position}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  position: e.target.value as Position,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="GOL">Goleiro (GOL)</option>
              <option value="ZAG">Zagueiro (ZAG)</option>
              <option value="LAT">Lateral (LAT)</option>
              <option value="MEI">Meio-Campo (MEI)</option>
              <option value="ATA">Atacante (ATA)</option>
            </select>
            {isContractActive && (
              <p className="text-[11px] text-amber-400 mt-1">
                🔒 A posição não pode ser alterada enquanto o atleta estiver sob
                contrato em um clube.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Idade (Mín: {player.age})
              </label>
              <input
                type="number"
                min={player.age}
                max={45}
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: Number(e.target.value) })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Agilidade (1 a 100)
              </label>
              <input
                type="number"
                min={1}
                max={formData.age >= 35 ? 85 : 100}
                value={formData.agility}
                onChange={(e) =>
                  setFormData({ ...formData, agility: Number(e.target.value) })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
