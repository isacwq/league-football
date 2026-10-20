import React, { useState, useEffect, useCallback } from 'react';
import { marketService } from '../../services/marketService';
import { useAppStore } from '../../store/useAppStore';
import type { Transaction, TransactionSummary } from '../../types';
import {
  formatCurrency,
  formatCashChange,
  formatDateTime,
} from '../../utils/formatters';

import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { AlertBanner } from '../../components/shared/AlertBanner';
import { EmptyState } from '../../components/shared/EmptyState';

type TransactionTypeFilter = 'ALL' | 'COMPRA' | 'VENDA';

const TYPE_OPTIONS: Array<{ value: TransactionTypeFilter; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'COMPRA', label: 'Compras' },
  { value: 'VENDA', label: 'Vendas' },
];

export const HistoryPage: React.FC = () => {
  const { selectedClubId, clubs } = useAppStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'COMPRA' | 'VENDA'>(
    'ALL'
  );
  const [playerSearch, setPlayerSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedClub = clubs.find((c) => c.id === selectedClubId);

  const fetchTransactions = useCallback(async () => {
    if (!selectedClubId) return;

    try {
      setLoading(true);
      setError(null);

      const typeParam = typeFilter === 'ALL' ? undefined : typeFilter;
      const response = await marketService.getTransactions(selectedClubId, {
        type: typeParam,
      });

      setTransactions(response.data);
      setSummary(response.summary);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar o histórico financeiro.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedClubId, typeFilter]);

  useEffect(() => {
    let isSubscribed = true;

    const load = async () => {
      await Promise.resolve();
      if (isSubscribed) {
        fetchTransactions();
      }
    };

    load();

    return () => {
      isSubscribed = false;
    };
  }, [fetchTransactions]);

  // Função para exportação dos dados da tabela em formato CSV
  const handleExportCSV = () => {
    if (!filteredTransactions.length) return;

    const headers = [
      'ID',
      'Data/Hora',
      'Atleta',
      'Tipo',
      'Valor (R$)',
      'Taxa (R$)',
      'Multa (R$)',
      'Variação Caixa (R$)',
    ];
    const rows = filteredTransactions.map((t) => [
      t.id,
      formatDateTime(t.created_at),
      `"${t.player_name.replace(/"/g, '""')}"`,
      t.type,
      formatCurrency(t.value),
      formatCurrency(t.fee),
      formatCurrency(t.penalty),
      formatCashChange(t.cash_change),
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((r) => r.join(';')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `historico_transacoes_${selectedClub?.acronym || 'clube'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredTransactions = transactions.filter((t) =>
    t.player_name.toLowerCase().includes(playerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Histórico de Transações
          </h1>
          <p className="text-sm text-slate-400">
            Extrato detalhado de compras, vendas e taxas financeiras do clube.
          </p>
        </div>

        {filteredTransactions.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center space-x-2"
          >
            <span>📥</span>
            <span>Exportar CSV</span>
          </button>
        )}
      </div>

      {!selectedClubId ? (
        <EmptyState
          title="Nenhum clube selecionado"
          description="Selecione um clube no cabeçalho para visualizar o extrato de transações."
        />
      ) : (
        <>
          {/* Dashboard Resumo Financeiro */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Total Gasto (Compras)
                </span>
                <div className="text-lg font-bold text-rose-400 mt-1 font-mono">
                  R$ {formatCurrency(summary.total_spent)}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Total Recebido (Vendas)
                </span>
                <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">
                  R$ {formatCurrency(summary.total_received)}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Taxas / Comissões
                </span>
                <div className="text-lg font-bold text-amber-400 mt-1 font-mono">
                  R$ {formatCurrency(summary.total_fees)}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Multas Pagas
                </span>
                <div className="text-lg font-bold text-rose-400 mt-1 font-mono">
                  R$ {formatCurrency(summary.total_penalties)}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 col-span-2 lg:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Lucro Líquido
                </span>
                <div
                  className={`text-lg font-bold mt-1 font-mono ${
                    summary.total_profit >= 0
                      ? 'text-teal-300'
                      : 'text-rose-400'
                  }`}
                >
                  R$ {formatCurrency(summary.total_profit)}
                </div>
              </div>
            </div>
          )}

          {/* Filtros da Tabela */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Filtrar por nome do atleta..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />

              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                {TYPE_OPTIONS.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setTypeFilter(type.value)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
                      typeFilter === type.value
                        ? 'bg-slate-900 text-emerald-400 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <AlertBanner message={error} onRetry={fetchTransactions} />}

          {loading ? (
            <LoadingSkeleton type="table" count={5} />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              title="Nenhuma transação encontrada"
              description="Não foram encontradas compras ou vendas registradas para os filtros selecionados."
            />
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Data / Hora</th>
                      <th className="px-4 py-3">Atleta</th>
                      <th className="px-4 py-3 text-center">Operação</th>
                      <th className="px-4 py-3 text-right">Valor Operação</th>
                      <th className="px-4 py-3 text-right">Taxa (5%)</th>
                      <th className="px-4 py-3 text-right">Multa</th>
                      <th className="px-4 py-3 text-right">Variação Caixa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTransactions.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">
                          {formatDateTime(t.created_at)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">
                          {t.player_name}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {t.type === 'COMPRA' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                              COMPRA
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                              VENDA
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-slate-200">
                          R$ {formatCurrency(t.value)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-amber-400">
                          R$ {formatCurrency(t.fee)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-rose-400">
                          R$ {formatCurrency(t.penalty)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold">
                          <span
                            className={
                              t.cash_change >= 0
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }
                          >
                            R$ {formatCashChange(t.cash_change)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
