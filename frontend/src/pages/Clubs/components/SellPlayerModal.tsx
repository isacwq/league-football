import React, { useState } from 'react';
import { marketService } from '../../../services/marketService';
import { useAppStore } from '../../../store/useAppStore';
import { formatCurrency, formatCashChange } from '../../../utils/formatters';
import type { Player, SellTransactionResponse } from '../../../types';

interface SellPlayerModalProps {
  player: Player | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SellPlayerModal: React.FC<SellPlayerModalProps> = ({
  player,
  onClose,
  onSuccess,
}) => {
  const { updateClubCash } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SellTransactionResponse | null>(null);

  if (!player) return null;

  const handleSell = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await marketService.sellPlayer(player.id);
      setResult(response);
      if (player.club_id) {
        updateClubCash(player.club_id, response.club_cash);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao vender jogador.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (result) {
      onSuccess();
    }
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
        <h2 className="text-lg font-bold text-white mb-1">
          {result ? 'Venda Concluída' : 'Vender Jogador'}
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

        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Deseja colocar o atleta no mercado? O valor creditado no caixa
              considerará o valor de mercado atual, a multa por fidelidade e a
              comissão sobre o lucro.
            </p>

            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Valor de Mercado Atual:</span>
                <span className="font-semibold text-white">
                  R$ {formatCurrency(player.market_value)}
                </span>
              </div>
              {player.contract && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor de Compra:</span>
                    <span className="font-semibold text-slate-300">
                      R$ {formatCurrency(player.contract.purchase_value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Dias Restantes da Fidelidade:
                    </span>
                    <span className="font-semibold text-amber-400">
                      {player.contract.remaining_days} dias
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Multa Prevista:</span>
                    <span className="font-semibold text-rose-400">
                      {player.contract.penalty_rate}%
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSell}
                disabled={loading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-rose-900/20"
              >
                {loading ? 'Vendendo...' : 'Confirmar Venda'}
              </button>
            </div>
          </div>
        ) : (
          /* Resumo Financeiro Pós-Venda */
          <div className="space-y-4">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Valor da Venda:</span>
                <span className="font-semibold text-white">
                  R$ {formatCurrency(result.value)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Multa por Fidelidade:</span>
                <span className="font-semibold text-rose-400">
                  - R$ {formatCurrency(result.penalty)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Comissão sobre Lucro:</span>
                <span className="font-semibold text-rose-400">
                  - R$ {formatCurrency(result.fee)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-700 font-bold text-sm">
                <span className="text-slate-200">
                  Crédito Líquido no Caixa:
                </span>
                <span className="text-emerald-400">
                  R$ {formatCashChange(result.cash_change)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Novo Saldo do Clube:</span>
                <span className="font-mono text-white">
                  R$ {formatCurrency(result.club_cash)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
