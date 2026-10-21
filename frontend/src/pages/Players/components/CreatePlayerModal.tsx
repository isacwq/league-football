import React, { useState } from 'react';
import { playerService } from '../../../services/playerService';
import { formatCurrency } from '../../../utils/formatters';
import type { Position, CreatePlayerDTO, Player } from '../../../types';

interface CreatePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePlayerModal: React.FC<CreatePlayerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPlayer, setCreatedPlayer] = useState<Player | null>(null);

  const initialFormData: CreatePlayerDTO = {
    name: '',
    position: 'MEI',
    agility: 50,
    age: 20,
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    physical: 50,
    potential: 70,
  };

  const [formData, setFormData] = useState<CreatePlayerDTO>(initialFormData);

  if (!isOpen) return null;

  const attributesSum =
    formData.pace +
    formData.shooting +
    formData.passing +
    formData.dribbling +
    formData.defending +
    formData.physical;

  const maxAttribute = Math.max(
    formData.pace,
    formData.shooting,
    formData.passing,
    formData.dribbling,
    formData.defending,
    formData.physical
  );

  const handleResetAndClose = () => {
    setCreatedPlayer(null);
    setError(null);
    setFormData(initialFormData);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (attributesSum > 480) {
      setError(
        `A soma dos 6 atributos é ${attributesSum}, mas não pode ultrapassar 480.`
      );
      return;
    }

    if (formData.potential < maxAttribute) {
      setError(
        `O potencial (${formData.potential}) deve ser no mínimo igual ao maior atributo (${maxAttribute}).`
      );
      return;
    }

    try {
      setLoading(true);
      const newPlayer = await playerService.createPlayer(formData);
      setCreatedPlayer(newPlayer);
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao cadastrar jogador.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const attributeFields: Array<{ label: string; key: keyof CreatePlayerDTO }> =
    [
      { label: 'Velocidade', key: 'pace' },
      { label: 'Finalização', key: 'shooting' },
      { label: 'Passe', key: 'passing' },
      { label: 'Drible', key: 'dribbling' },
      { label: 'Defesa', key: 'defending' },
      { label: 'Físico', key: 'physical' },
    ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-slate-100 my-8">
        {/* TELA DE CONFIRMAÇÃO: JOGADOR CADASTRADO */}
        {createdPlayer ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xl">✅</span>
                <h2 className="text-xl font-bold text-white">
                  Jogador Cadastrado
                </h2>
              </div>
              <button
                onClick={handleResetAndClose}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-1">
              <p className="text-base font-bold text-white">
                {createdPlayer.name}
              </p>
              <p className="text-xs text-emerald-400 font-semibold">
                Entrou livre e Apto • Posição: {createdPlayer.position} •{' '}
                {createdPlayer.age} anos
              </p>
            </div>

            {/* Exibição dos Valores Calculados pela API */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Overall
                </span>
                <span className="text-2xl font-bold text-emerald-400 font-mono">
                  {createdPlayer.overall}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Pelos pesos da posição
                </span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Valor Base
                </span>
                <span className="text-xl font-bold text-white font-mono">
                  R$ {formatCurrency(createdPlayer.base_value)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Calculado no cadastro
                </span>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Valor de Mercado
                </span>
                <span className="text-xl font-bold text-teal-300 font-mono">
                  R$ {formatCurrency(createdPlayer.market_value)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Condição, agilidade e idade
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              ℹ️ O valor base e os indicadores técnicos são gravados no cadastro
              e não mudam mais. O valor de mercado e o overall serão atualizados
              dinamicamente a cada consulta.
            </p>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/20"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE CADASTRO */
          <>
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Novo Jogador</h2>
              <button
                onClick={handleResetAndClose}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="Ex: André Lacerda"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Posição
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position: e.target.value as Position,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GOL">Goleiro (GOL)</option>
                    <option value="ZAG">Zagueiro (ZAG)</option>
                    <option value="LAT">Lateral (LAT)</option>
                    <option value="MEI">Meio-Campo (MEI)</option>
                    <option value="ATA">Atacante (ATA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Idade (16 a 45 anos)
                  </label>
                  <input
                    type="number"
                    min={16}
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
                    max={100}
                    value={formData.agility}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agility: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-emerald-400">
                    Indicadores Técnicos (1 a 99)
                  </h3>
                  <span
                    className={`text-xs font-bold ${attributesSum > 480 ? 'text-rose-400' : 'text-slate-400'}`}
                  >
                    Soma: {attributesSum} / 480
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attributeFields.map((attr) => (
                    <div key={attr.key}>
                      <label className="block text-[11px] text-slate-400">
                        {attr.label}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={formData[attr.key] as number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [attr.key]: Number(e.target.value),
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Potencial (Mínimo: {maxAttribute})
                </label>
                <input
                  type="number"
                  min={maxAttribute}
                  max={99}
                  value={formData.potential}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      potential: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                >
                  {loading ? 'Salvar...' : 'Salvar Jogador'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
