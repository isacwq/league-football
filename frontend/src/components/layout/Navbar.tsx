import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { clubService } from '../../services/clubService';
import { formatCurrency } from '../../utils/formatters';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { clubs, selectedClubId, setClubs, setSelectedClubId } = useAppStore();

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const data = await clubService.getClubs();
        setClubs(data);
        if (selectedClubId === null && data.length > 0) {
          setSelectedClubId(data[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar lista de clubes na Navbar:', error);
      }
    };

    loadClubs();
  }, [setClubs, setSelectedClubId, selectedClubId]);

  const selectedClub = clubs.find((c) => c.id === selectedClubId);

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/players', label: 'Jogadores' },
    { path: '/clubs', label: 'Clubes' },
    { path: '/market', label: 'Mercado' },
    { path: '/league', label: 'Liga & Partidas' },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome da Aplicação */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                PASSE
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                Gestão
              </span>
            </Link>
          </div>

          {/* Links de Navegação Principal */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Seletor do Clube Ativo + Saldo Financeiro */}
          <div className="flex items-center space-x-4">
            {clubs.length > 0 ? (
              <div className="flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <div className="flex flex-col text-right">
                  <label
                    htmlFor="club-select"
                    className="text-[10px] text-slate-400 uppercase tracking-wider"
                  >
                    Clube Ativo
                  </label>
                  <select
                    id="club-select"
                    value={selectedClubId ?? ''}
                    onChange={(e) => setSelectedClubId(Number(e.target.value))}
                    className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
                  >
                    {clubs.map((club) => (
                      <option
                        key={club.id}
                        value={club.id}
                        className="bg-slate-900 text-white"
                      >
                        {club.name} ({club.acronym})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClub && (
                  <div className="pl-3 border-l border-slate-700 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Saldo
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      R$ {formatCurrency(selectedClub.cash)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Nenhum clube cadastrado
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
