import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import type { Player } from '../../../types';

interface PlayerDetailModalProps {
  player: Player | null;
  clubName?: string;
  onClose: () => void;
  onEdit?: () => void;
  onChangeCondition?: () => void;
  onBuy?: () => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  clubName,
  onClose,
  onEdit,
  onChangeCondition,
  onBuy,
}) => {
  if (!player) return null;

  const attributes = [
    { label: 'Velocidade (Pace)', value: player.pace },
    { label: 'Finalização (Shooting)', value: player.shooting },
    { label: 'Passe (Passing)', value: player.passing },
    { label: 'Drible (Dribbling)', value: player.dribbling },
    { label: 'Defesa (Defending)', value: player.defending },
    { label: 'Físico (Physical)', value: player.physical },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-slate-100 my-8">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white">{player.name}</h2>
            <span className="px-2.5 py-0.5 rounded text-xs bg-slate-800 font-mono font-bold text-emerald-400 border border-slate-700">
              {player.position}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-6">
          {/* Informações Gerais */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Idade
              </span>
              <span className="font-bold text-white text-sm">
                {player.age} anos
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Agilidade
              </span>
              <span className="font-bold text-white text-sm">
                {player.agility}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Potencial
              </span>
              <span className="font-bold text-amber-400 text-sm">
                {player.potential}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Condição
              </span>
              <span className="font-semibold text-emerald-400 text-sm">
                {player.condition === 'APTO' && '• Apto'}
                {player.condition === 'MAL_CONDICIONADO' &&
                  '• Mal Condicionado'}
                {player.condition === 'DOENTE' && '• Doente'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Clube / Vínculo
              </span>
              <span className="font-semibold text-white text-sm">
                {clubName ? clubName : 'Livre (Sem Clube)'}
              </span>
            </div>
          </div>

          {/* Valores Calculados */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Overall
              </span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {player.overall}
              </span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Valor Base
              </span>
              <span className="text-lg font-bold text-white font-mono">
                R$ {formatCurrency(player.base_value)}
              </span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Valor de Mercado
              </span>
              <span className="text-lg font-bold text-teal-300 font-mono">
                R$ {formatCurrency(player.market_value)}
              </span>
            </div>
          </div>

          {/* Atributos Técnicos com Barras de Progresso */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Indicadores Técnicos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attributes.map((attr) => (
                <div
                  key={attr.label}
                  className="bg-slate-800/40 p-3 rounded-lg border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      {attr.label}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {attr.value}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, attr.value))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex space-x-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit();
                }}
                className="px-3 py-1.5 bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/40 rounded-lg text-xs font-semibold transition-colors"
              >
                ✏️ Editar
              </button>
            )}
            {onChangeCondition && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onChangeCondition();
                }}
                className="px-3 py-1.5 bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/40 rounded-lg text-xs font-semibold transition-colors"
              >
                🏥 Alterar Condição
              </button>
            )}
            {onBuy && player.club_id === null && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBuy();
                }}
                className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/40 rounded-lg text-xs font-semibold transition-colors"
              >
                🛒 Comprar
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
