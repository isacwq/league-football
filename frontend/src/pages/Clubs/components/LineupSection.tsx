import React, { useState, useEffect, useCallback } from 'react';
import { clubService } from '../../../services/clubService';
import type { ClubWithSquad, Player, Formation, Lineup } from '../../../types';
import { AlertBanner } from '../../../components/shared/AlertBanner';

interface LineupSectionProps {
  club: ClubWithSquad;
  onLineupUpdated?: () => void;
}

export const LineupSection: React.FC<LineupSectionProps> = ({
  club,
  onLineupUpdated,
}) => {
  const [formation, setFormation] = useState<Formation>('2-1-1');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<
    Array<number | ''>
  >(['', '', '', '', '']);

  const [lineupData, setLineupData] = useState<Lineup | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Define os setores/vagas para cada formação
  const getSlotsForFormation = (
    fmt: Formation
  ): Array<{ label: string; allowed: string[] }> => {
    switch (fmt) {
      case '3-1':
        return [
          { label: 'Goleiro GOL', allowed: ['GOL'] },
          { label: 'Defesa ZAG ou LAT', allowed: ['ZAG', 'LAT'] },
          { label: 'Defesa ZAG ou LAT', allowed: ['ZAG', 'LAT'] },
          { label: 'Defesa ZAG ou LAT', allowed: ['ZAG', 'LAT'] },
          { label: 'Ataque ATA', allowed: ['ATA'] },
        ];
      case '2-2':
        return [
          { label: 'Goleiro GOL', allowed: ['GOL'] },
          { label: 'Defesa ZAG ou LAT', allowed: ['ZAG', 'LAT'] },
          { label: 'Defesa ZAG ou LAT', allowed: ['ZAG', 'LAT'] },
          { label: 'Ataque ATA', allowed: ['ATA'] },
          { label: 'Ataque ATA', allowed: ['ATA'] },
        ];
      case '2-1-1':
        return [
          { label: 'Goleiro GOL', allowed: ['GOL'] },
          { label: 'Defesa ZAG ou LAT', allowed: ['ZAG', 'LAT'] },
          { label: 'Defesa ZAG ou LAT', allowed: ['ZAG', 'LAT'] },
          { label: 'Meio MEI', allowed: ['MEI'] },
          { label: 'Ataque ATA', allowed: ['ATA'] },
        ];
      case '1-2-1':
        return [
          { label: 'Goleiro GOL', allowed: ['GOL'] },
          { label: 'Defesa ZAG ou LAT', allowed: ['ZAG', 'LAT'] },
          { label: 'Meio MEI', allowed: ['MEI'] },
          { label: 'Meio MEI', allowed: ['MEI'] },
          { label: 'Ataque ATA', allowed: ['ATA'] },
        ];
      default:
        return [
          { label: 'Goleiro GOL', allowed: ['GOL'] },
          { label: 'Defesa ZAG ou LAT', allowed: ['ZAG', 'LAT'] },
          { label: 'Defesa ZAG ou LAT', allowed: ['ZAG', 'LAT'] },
          { label: 'Meio MEI', allowed: ['MEI'] },
          { label: 'Ataque ATA', allowed: ['ATA'] },
        ];
    }
  };

  const fetchLineup = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clubService.getLineup(club.id);
      setLineupData(data);

      if (data.formation) {
        setFormation(data.formation);
      }

      // Se existir escalação salva, preenche os seletores
      if (data.players && data.players.length > 0) {
        const ids: Array<number | ''> = ['', '', '', '', ''];
        data.players.forEach((p, index) => {
          if (index < 5) ids[index] = p.id;
        });
        setSelectedPlayerIds(ids);
      } else {
        // Tenta auto-preencher por vagas caso o clube não tenha escalação salva
        const slots = getSlotsForFormation('2-1-1');
        const autoIds: Array<number | ''> = ['', '', '', '', ''];
        const used = new Set<number>();

        slots.forEach((slot, idx) => {
          const candidate = club.players.find(
            (p) =>
              slot.allowed.includes(p.position) &&
              p.condition !== 'DOENTE' &&
              !used.has(p.id)
          );
          if (candidate) {
            autoIds[idx] = candidate.id;
            used.add(candidate.id);
          }
        });
        setSelectedPlayerIds(autoIds);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar escalação do clube.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [club]);

  useEffect(() => {
    let isSubscribed = true;

    const load = async () => {
      await Promise.resolve();
      if (isSubscribed) {
        fetchLineup();
      }
    };

    load();

    return () => {
      isSubscribed = false;
    };
  }, [fetchLineup]);

  const slots = getSlotsForFormation(formation);

  // Auxiliar para obter jogador completo combinando dados do clube e da escalação
  const getFullPlayer = (id: number | ''): Player | undefined => {
    if (typeof id !== 'number' || !id) return undefined;
    const squadPlayer = club.players.find((p) => p.id === id);
    const lineupPlayer = lineupData?.players?.find((p) => p.id === id);
    if (squadPlayer && lineupPlayer) {
      return { ...lineupPlayer, ...squadPlayer };
    }
    return squadPlayer || lineupPlayer;
  };

  // Extrai o valor de um atributo do jogador buscando variações em inglês/português
  const getAttrValue = (player: Player, ...keys: string[]): number | string => {
    const obj = player as unknown as Record<string, unknown>;
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) return String(obj[key]);
    }
    if (obj.attributes && typeof obj.attributes === 'object') {
      const attrs = obj.attributes as Record<string, unknown>;
      for (const key of keys) {
        if (attrs[key] !== undefined && attrs[key] !== null)
          return String(attrs[key]);
      }
    }
    return '–';
  };

  // Formata os atributos usados por posição nos duelos
  const renderUsedAttributes = (player: Player) => {
    switch (player.position) {
      case 'GOL':
      case 'ZAG':
        return (
          <span className="font-mono text-xs">
            <span className="text-slate-400">Defesa:</span>{' '}
            <strong className="text-emerald-400">
              {getAttrValue(player, 'defending', 'defesa')}
            </strong>
          </span>
        );
      case 'LAT':
        return (
          <span className="font-mono text-xs space-x-2">
            <span>
              <span className="text-slate-400">Drible:</span>{' '}
              <strong className="text-emerald-400">
                {getAttrValue(player, 'dribbling', 'drible')}
              </strong>
            </span>
            <span>
              <span className="text-slate-400">Defesa:</span>{' '}
              <strong className="text-emerald-400">
                {getAttrValue(player, 'defending', 'defesa')}
              </strong>
            </span>
          </span>
        );
      case 'MEI':
        return (
          <span className="font-mono text-xs">
            <span className="text-slate-400">Passe:</span>{' '}
            <strong className="text-emerald-400">
              {getAttrValue(player, 'passing', 'passe')}
            </strong>
          </span>
        );
      case 'ATA':
        return (
          <span className="font-mono text-xs">
            <span className="text-slate-400">Finalização:</span>{' '}
            <strong className="text-emerald-400">
              {getAttrValue(player, 'shooting', 'finalizacao')}
            </strong>
          </span>
        );
      default:
        return null;
    }
  };

  // Obtém lista de atletas selecionados para os 5 titulares
  const selectedPlayers = selectedPlayerIds
    .map((id) => getFullPlayer(id))
    .filter((p): p is Player => p !== undefined);

  const malCondicionados = selectedPlayers.filter(
    (p) => p.condition === 'MAL_CONDICIONADO'
  );

  const handleSelectPlayer = (index: number, playerId: number | '') => {
    const updated = [...selectedPlayerIds];
    updated[index] = playerId;
    setSelectedPlayerIds(updated);
  };

  const handleSaveLineup = async () => {
    setError(null);
    setSuccessMessage(null);

    // Validação de preenchimento dos 5 titulares
    const validIds = selectedPlayerIds.filter(
      (id): id is number => typeof id === 'number' && id > 0
    );
    if (validIds.length < 5) {
      setError(
        'Escolha a formação e um titular para cada uma das 5 vagas para salvar.'
      );
      return;
    }

    if (new Set(validIds).size < 5) {
      setError('Você selecionou um mesmo jogador em mais de uma vaga.');
      return;
    }

    try {
      setSaving(true);
      await clubService.updateLineup(club.id, {
        formation,
        player_ids: validIds,
      });

      setSuccessMessage(
        `Escalação salva com sucesso! ${club.name} escalado na formação ${formation}.`
      );
      await fetchLineup();
      if (onLineupUpdated) onLineupUpdated();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar escalação.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <AlertBanner message={error} onRetry={fetchLineup} />}

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex justify-between items-center">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-400 font-bold hover:underline"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-400 animate-pulse">
          Carregando escalação tática...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda & Centro: Formação e Seleção de Titulares */}
          <div className="lg:col-span-2 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            {/* Escolha da Formação Tática */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Formação Tática
                </h3>
                {lineupData?.complete ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ✓ Escalação Completa
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    ⚠️ Escalação Incompleta
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['3-1', '2-2', '2-1-1', '1-2-1'] as Formation[]).map(
                  (fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => {
                        setFormation(fmt);
                        setSelectedPlayerIds(['', '', '', '', '']);
                      }}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        formation === fmt
                          ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-base font-mono block text-white">
                        {fmt}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {fmt === '3-1' && 'Defesa 3, ataque 1'}
                        {fmt === '2-2' && 'Defesa 2, ataque 2'}
                        {fmt === '2-1-1' && 'Defesa 2, meio 1, ataque 1'}
                        {fmt === '1-2-1' && 'Defesa 1, meio 2, ataque 1'}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Tabela dos 5 Titulares */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Titulares da Equipe
              </h3>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-[11px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2.5">Vaga</th>
                      <th className="px-3 py-2.5">Titular</th>
                      <th className="px-3 py-2.5">Condição</th>
                      <th className="px-3 py-2.5 text-center">Overall</th>
                      <th className="px-3 py-2.5">Atributos Usados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {slots.map((slot, idx) => {
                      const selectedId = selectedPlayerIds[idx];
                      const player = getFullPlayer(selectedId);

                      // Candidatos disponíveis para a vaga (exclui doentes)
                      const availableCandidates = club.players.filter(
                        (p) =>
                          slot.allowed.includes(p.position) &&
                          p.condition !== 'DOENTE'
                      );

                      return (
                        <tr
                          key={idx}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-3 py-3 font-semibold text-xs text-slate-400">
                            {slot.label}
                          </td>
                          <td className="px-3 py-3">
                            <select
                              value={selectedId}
                              onChange={(e) =>
                                handleSelectPlayer(
                                  idx,
                                  e.target.value ? Number(e.target.value) : ''
                                )
                              }
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                            >
                              <option value="">Selecione um atleta...</option>
                              {availableCandidates.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.position}) - {p.condition}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {player ? (
                              player.condition === 'APTO' ? (
                                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                                  • Apto
                                </span>
                              ) : player.condition === 'MAL_CONDICIONADO' ? (
                                <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                                  • Mal condicionado
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold">
                                  • Doente
                                </span>
                              )
                            ) : (
                              <span className="text-slate-600 text-xs">–</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-emerald-400 text-xs">
                            {player ? player.overall : '–'}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {player ? (
                              renderUsedAttributes(player)
                            ) : (
                              <span className="text-slate-600 text-xs">–</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alerta de Atletas Mal Condicionados */}
            {malCondicionados.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>
                    {malCondicionados.map((p) => p.name).join(' e ')}{' '}
                    {malCondicionados.length > 1
                      ? 'estão mal condicionados'
                      : 'está mal condicionado'}
                  </span>
                </div>
                <p className="text-slate-400">
                  Podem jogar normalmente, mas cada atributo técnico terá
                  penalidade de **15% a menos** durante os duelos da partida.
                </p>
              </div>
            )}

            {/* Ações de Salvar */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleSaveLineup}
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
              >
                {saving ? 'Salvando Escalação...' : 'Salvar Escalação Tática'}
              </button>
            </div>
          </div>

          {/* Coluna Direita: Campo Visual e Reservas */}
          <div className="space-y-6">
            {/* Campo de Futebol Visual */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Em Campo (Prévia {formation})
              </h3>

              <div className="relative w-full h-80 bg-emerald-900/40 rounded-2xl border-2 border-emerald-500/30 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                {/* Linhas do Campo */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-emerald-500/20 pointer-events-none" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-emerald-500/20 rounded-full pointer-events-none" />

                {/* Ataque */}
                <div className="flex justify-around items-center z-10">
                  {selectedPlayers.slice(3).map((p, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white border-2 border-emerald-400 font-bold font-mono text-xs flex items-center justify-center shadow-lg">
                        {p ? p.position : '?'}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-200 mt-1 truncate max-w-[80px]">
                        {p ? p.name.split(' ')[0] : 'Vaga'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Meio / Defesa de Linha */}
                <div className="flex justify-around items-center z-10">
                  {selectedPlayers.slice(1, 3).map((p, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-sky-600 text-white border-2 border-sky-400 font-bold font-mono text-xs flex items-center justify-center shadow-lg">
                        {p ? p.position : '?'}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-200 mt-1 truncate max-w-[80px]">
                        {p ? p.name.split(' ')[0] : 'Vaga'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Goleiro */}
                <div className="flex justify-center items-center z-10">
                  {selectedPlayers.slice(0, 1).map((p, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-amber-600 text-white border-2 border-amber-400 font-bold font-mono text-xs flex items-center justify-center shadow-lg">
                        {p ? p.position : 'GOL'}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-200 mt-1 truncate max-w-[80px]">
                        {p ? p.name.split(' ')[0] : 'Goleiro'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reservas (Jogadores do elenco fora da escalação) */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Reservas do Elenco
              </h3>

              {club.players.filter((p) => !selectedPlayerIds.includes(p.id))
                .length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Nenhum jogador reserva fora da escalação.
                </p>
              ) : (
                <div className="space-y-2">
                  {club.players
                    .filter((p) => !selectedPlayerIds.includes(p.id))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white block">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {p.position} • Overall: {p.overall}
                          </span>
                        </div>
                        <div>
                          {p.condition === 'APTO' && (
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              • Apto
                            </span>
                          )}
                          {p.condition === 'MAL_CONDICIONADO' && (
                            <span className="text-[10px] text-amber-400 font-semibold">
                              • Mal condicionado
                            </span>
                          )}
                          {p.condition === 'DOENTE' && (
                            <span className="text-[10px] text-rose-400 font-semibold">
                              • Doente (Não jogável)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
