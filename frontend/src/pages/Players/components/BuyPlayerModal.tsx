import React, { useState } from 'react';
import { marketService } from '../../../services/marketService';
import { useAppStore } from '../../../store/useAppStore';
import {
  formatCurrency,
  formatDateToISOWithTimezone,
} from '../../../utils/formatters';
import type { Player } from '../../../types';

interface BuyPlayerModalProps {
  player: Player | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const BuyPlayerModal: React.FC<BuyPlayerModalProps> = ({
  player,
  onClose,
  onSuccess,
}) => {
  const { clubs, selectedClubId, updateClubCash } = useAppStore();
  const [buyerClubId, setBuyerClubId] = useState<number>(
    selectedClubId || clubs[0]?.id || 0
  );

  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 1);

  const [loyaltyDate, setLoyaltyDate] = useState<string>(
    defaultDate.toISOString().slice(0, 16)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!player) return null;

  const fee =
    player.market_value > 30
      ? Math.round(player.market_value * 0.05 * 100) / 100
      : 0;
  const totalCost = player.market_value + fee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerClubId) {
      setError('Selecione um clube comprador.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formattedLoyalty = formatDateToISOWithTimezone(
        new Date(loyaltyDate)
      );

      const response = await marketService.buyPlayer(player.id, {
        club_id: buyerClubId,
        loyalty_until: formattedLoyalty,
      });

      updateClubCash(buyerClubId, response.club_cash);
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível concluir a compra.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
        <h2 className="text-lg font-bold text-white mb-1">Comprar Jogador</h2>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Clube Comprador
            </label>
            <select
              value={buyerClubId}
              onChange={(e) => setBuyerClubId(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Caixa: R$ {formatCurrency(c.cash)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fim da Fidelidade do Contrato
            </label>
            <input
              type="datetime-local"
              required
              value={loyaltyDate}
              onChange={(e) => setLoyaltyDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Valor de Mercado:</span>
              <span className="font-semibold text-white">
                R$ {formatCurrency(player.market_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">
                Taxa de Transferência (5%):
              </span>
              <span className="font-semibold text-white">
                R$ {formatCurrency(fee)}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-700 font-bold">
              <span className="text-slate-200">Custo Total:</span>
              <span className="text-emerald-400 text-sm">
                R$ {formatCurrency(totalCost)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-900/20"
            >
              {loading ? 'Processando...' : 'Confirmar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
