import React, { useState } from 'react';
import { clubService } from '../../../services/clubService';
import { useAppStore } from '../../../store/useAppStore';

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateClubModal: React.FC<CreateClubModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { setClubs } = useAppStore();
  const [name, setName] = useState('');
  const [acronym, setAcronym] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await clubService.createClub({ name, acronym: acronym.toUpperCase() });
      const updatedClubs = await clubService.getClubs();
      setClubs(updatedClubs);
      onSuccess();
      onClose();
      setName('');
      setAcronym('');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar clube.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Novo Clube</h2>
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
              Nome do Clube
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Águias FC"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sigla (3 letras maiúsculas)
            </label>
            <input
              type="text"
              required
              maxLength={3}
              value={acronym}
              onChange={(e) => setAcronym(e.target.value.toUpperCase())}
              placeholder="Ex: AGU"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 uppercase"
            />
          </div>

          <p className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
            ℹ️ O clube iniciará automaticamente com{' '}
            <strong className="text-emerald-400">R$ 300,00</strong> de caixa e
            sem jogadores.
          </p>

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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Clube'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
