import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playerService } from '../../services/playerService';
import { clubService } from '../../services/clubService';
import { api } from '../../services/api';

interface SummaryMetrics {
  totalPlayers: number;
  freePlayers: number;
  totalClubs: number;
  totalMatches: number;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<SummaryMetrics>({
    totalPlayers: 0,
    freePlayers: 0,
    totalClubs: 0,
    totalMatches: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);

      // Busca dados em paralelo para preencher os contadores da tela inicial
      const [playersRes, freeRes, clubsRes, matchesRes] =
        await Promise.allSettled([
          playerService.getPlayers({ limit: 1 }),
          playerService.getPlayers({ free: true, limit: 1 }),
          clubService.getClubs(),
          api.get('/matches'),
        ]);

      const totalPlayers =
        playersRes.status === 'fulfilled'
          ? (playersRes.value.meta?.total_items ?? 0)
          : 0;
      const freePlayers =
        freeRes.status === 'fulfilled'
          ? (freeRes.value.meta?.total_items ?? 0)
          : 0;
      const totalClubs =
        clubsRes.status === 'fulfilled' ? (clubsRes.value.length ?? 0) : 0;

      let totalMatches = 0;
      if (matchesRes.status === 'fulfilled') {
        const matchesData = matchesRes.value.data;
        totalMatches = Array.isArray(matchesData)
          ? matchesData.length
          : (matchesData?.meta?.total_items ?? 0);
      }

      setMetrics({
        totalPlayers,
        freePlayers,
        totalClubs,
        totalMatches,
      });
    } catch (err) {
      console.error('Erro ao carregar métricas da página inicial:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const loadData = async () => {
      await Promise.resolve();
      if (isSubscribed) {
        fetchMetrics();
      }
    };

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [fetchMetrics]);

  // Suporte ao atalho do teclado (Tecla Enter inicia o sistema)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        navigate('/players');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const modules = [
    {
      step: '01',
      title: 'Jogadores',
      subtitle: 'Cadastro e Atributos',
      desc: 'Cadastro de atletas com 6 habilidades técnicas, overall dinâmico e valor de mercado calculado.',
      icon: '🏃',
      path: '/players',
      color:
        'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      step: '02',
      title: 'Clubes',
      subtitle: 'Gestão de Elencos',
      desc: 'Fundação de clubes com caixa inicial de R$ 300,00, gestão de folha e patrimônio líquido.',
      icon: '🛡️',
      path: '/clubs',
      color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400',
    },
    {
      step: '03',
      title: 'Compra',
      subtitle: 'Mercado de Transferências',
      desc: 'Contratação de atletas livres com aplicação de taxas administrativas e contrato de fidelidade.',
      icon: '🛒',
      path: '/market',
      color:
        'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400',
    },
    {
      step: '04',
      title: 'Venda',
      subtitle: 'Rescisão e Comissões',
      desc: 'Venda de atletas com rescisão contratual, cálculo de multas regressivas e crédito no caixa.',
      icon: '💰',
      path: '/clubs',
      color:
        'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
    },
    {
      step: '05',
      title: 'Histórico',
      subtitle: 'Extrato Financeiro',
      desc: 'Registro completo de transações com resumo de lucros, taxas, multas e exportação para CSV.',
      icon: '📊',
      path: '/clubs',
      color:
        'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
    },
    {
      step: '06',
      title: 'Liga',
      subtitle: 'Escalação e Partidas',
      desc: 'Montagem do quinteto titular em formações táticas, duelos por atributos e tabela do campeonato.',
      icon: '🏆',
      path: '/league',
      color:
        'from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-400',
    },
  ];

  return (
    <div className="min-h-[85vh] flex flex-col justify-between space-y-10 py-6">
      {/* SEÇÃO PRINCIPAL / HERO HEADER */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Elemento Decorativo de Fundo */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Não precisa de login</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Passe{' '}
              <span className="text-emerald-400 font-normal text-2xl sm:text-3xl block sm:inline">
                — Gestão da liga, do mercado à classificação
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Cadastre jogadores, monte os clubes e negocie com contrato de
              fidelidade. Depois, escale os titulares e jogue partidas com
              placar calculado pelos atributos.
            </p>
          </div>

          {/* Botão de Ação Principal + Atalho Enter */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={() => navigate('/players')}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-emerald-900/30 transition-all hover:scale-[1.02] flex items-center space-x-3 group cursor-pointer"
            >
              <span>Iniciar</span>
              <span className="text-xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
            <span className="text-xs text-slate-500 font-mono">
              Pressione{' '}
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 font-bold">
                Enter ↵
              </kbd>{' '}
              para começar
            </span>
          </div>
        </div>

        {/* MÉTRICAS E CONTADORES EM TEMPO REAL */}
        <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase font-bold block mb-1">
              Total Jogadores
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                metrics.totalPlayers
              )}
            </div>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase font-bold block mb-1">
              Jogadores Livres
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                metrics.freePlayers
              )}
            </div>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase font-bold block mb-1">
              Clubes Cadastrados
            </span>
            <div className="text-2xl font-black text-sky-400 font-mono">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${metrics.totalClubs} / 20`
              )}
            </div>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase font-bold block mb-1">
              Partidas Jogadas
            </span>
            <div className="text-2xl font-black text-purple-400 font-mono">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                metrics.totalMatches
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CARDS DOS MÓDULOS DO SISTEMA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            Fluxo de Gestão do Campeonato
          </h2>
          <span className="text-xs text-slate-500">6 Módulos Integrados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <div
              key={mod.step}
              onClick={() => navigate(mod.path)}
              className={`group bg-slate-900 border p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between space-y-4 bg-gradient-to-br ${mod.color}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{mod.icon}</span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-400 border border-slate-700">
                    Módulo {mod.step}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {mod.title}
                  </h3>
                  <span className="text-xs font-semibold text-slate-400 block mb-2">
                    {mod.subtitle}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
                <span>Acessar Módulo</span>
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RODAPÉ DA LIGA */}
      <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-400">Passe</span>
          <span>•</span>
          <span>Liga Fictícia 2026</span>
        </div>
        <span>Horário Oficial de Brasília (UTC−3)</span>
      </div>
    </div>
  );
};
