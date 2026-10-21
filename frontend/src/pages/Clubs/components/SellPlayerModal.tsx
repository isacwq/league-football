import React, { useState } from 'react';
import { marketService } from '../../../services/marketService';
import { playerService } from '../../../services/playerService';
import { api } from '../../../services/api';
import type { Player } from '../../../types';
import {
  formatCurrency,
  formatCashChange,
  formatDateTime,
} from '../../../utils/formatters';

interface SellPlayerModalProps {
  player: Player | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface SellResult {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: string;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: string;
  club_cash: number;
}

export const SellPlayerModal: React.FC<SellPlayerModalProps> = ({
  player,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<SellResult | null>(null);

  if (!player) return null;

  // Extrai informações do contrato (suporta player.contract ou propriedades na raiz do objeto)
  const contract = player.contract;
  const rawPlayer = player as unknown as Record<string, unknown>;

  const loyaltyUntil =
    (contract?.loyalty_until as string) ||
    (rawPlayer.loyalty_until as string) ||
    null;
  const purchaseValue =
    contract?.purchase_value ??
    (rawPlayer.purchase_value as number) ??
    player.market_value;
  const remainingDays =
    contract?.remaining_days ?? (rawPlayer.remaining_days as number) ?? 0;
  const penaltyRate =
    contract?.penalty_rate ?? (rawPlayer.penalty_rate as number) ?? 0;

  const handleConfirmSell = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: SellResult;
      const mService = marketService as Record<string, unknown>;
      const pService = playerService as Record<string, unknown>;

      if (typeof mService.sellPlayer === 'function') {
        data = await (
          mService.sellPlayer as (id: number) => Promise<SellResult>
        )(player.id);
      } else if (typeof pService.sellPlayer === 'function') {
        data = await (
          pService.sellPlayer as (id: number) => Promise<SellResult>
        )(player.id);
      } else {
        const response = await api.post(`/players/${player.id}/sell`);
        data = response.data;
      }

      setResultData(data);
      onSuccess();
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        errObj.response?.data?.message ||
        errObj.message ||
        'Erro ao processar a venda do atleta.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setResultData(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100 my-8">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            {resultData ? 'Venda Concluída' : `Vender ${player.name}?`}
          </h2>
          <button
            onClick={handleModalClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* TELA DE SUCESSO APÓS CONFIRMAR A VENDA */}
        {resultData ? (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
              ✓ <strong>{player.name}</strong> foi vendido e voltou a ficar
              livre no mercado de transferências.
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Valor de Venda (Mercado)</span>
                <span className="font-mono font-bold text-white">
                  R$ {formatCurrency(resultData.value)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Valor Pago de Compra</span>
                <span className="font-mono text-slate-300">
                  R$ {formatCurrency(resultData.purchase_value)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">
                  Multa Rescisória ({resultData.penalty_rate}%)
                </span>
                <span className="font-mono text-rose-400">
                  R$ {formatCurrency(resultData.penalty)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Lucro Obtido</span>
                <span
                  className={`font-mono font-semibold ${(resultData.profit ?? 0) >= 0 ? 'text-teal-300' : 'text-rose-400'}`}
                >
                  R$ {formatCurrency(resultData.profit ?? 0)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Comissão de Venda</span>
                <span className="font-mono text-amber-400">
                  R$ {formatCurrency(resultData.fee)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-200">
                  Crédito no Caixa
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  R$ {formatCashChange(resultData.cash_change)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Novo Caixa do Clube</span>
                <span className="font-mono font-bold text-white">
                  R$ {formatCurrency(resultData.club_cash)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-slate-500">Status do Contrato</span>
                <span className="font-mono uppercase font-bold text-amber-400">
                  {resultData.contract_status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO / CONFIRMAÇÃO DE VENDA DA FICHA DO ATLETA */
          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-400">
              O atleta sairá do elenco do clube e ficará novamente disponível
              para contratação por outras equipes.
            </p>

            {/* Identificação do Atleta */}
            <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-white block">
                  {player.name}
                </span>
                <span className="text-xs text-slate-400">
                  {player.age} anos • Overall:{' '}
                  <strong className="text-emerald-400 font-mono">
                    {player.overall}
                  </strong>
                </span>
              </div>
              <span className="px-2.5 py-1 bg-slate-800 text-xs font-mono font-bold text-emerald-400 border border-slate-700 rounded-lg">
                {player.position}
              </span>
            </div>

            {/* Detalhes do Contrato e Fidelidade */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800/80 space-y-3 text-xs">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Condições do Contrato
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Valor de Mercado
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    R$ {formatCurrency(player.market_value)}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Valor Pago de Compra
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-200">
                    R$ {formatCurrency(purchaseValue)}
                  </span>
                </div>
              </div>

              {/* FIM DA FIDELIDADE */}
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                    📅 <span>Fim da Fidelidade:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {loyaltyUntil
                      ? formatDateTime(loyaltyUntil)
                      : 'Não informada'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Dias Restantes:</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {remainingDays} {remainingDays === 1 ? 'dia' : 'dias'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">% Multa por Rescisão:</span>
                  <span
                    className={`font-mono font-bold ${penaltyRate > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
                  >
                    {penaltyRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Aviso sobre Titularidade */}
            <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 leading-relaxed">
              ⚠️ <strong>Atenção:</strong> A venda é efetuada pelo valor de
              mercado do momento. Se o atleta for titular na escalação tática,
              ele será automaticamente removido e o clube precisará reescalar 5
              titulares para poder disputar partidas.
            </p>

            {/* Botões de Ação */}
            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleModalClose}
                disabled={loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmSell}
                disabled={loading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-rose-900/20 disabled:opacity-50 flex items-center space-x-1.5"
              >
                <span>{loading ? 'Vendendo...' : 'Confirmar Venda'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
