import { api } from './api';
import { Match, CreateMatchDTO, Standing } from '../types';

export const leagueService = {
  /**
   * Lista todas as partidas já simuladas na liga
   */
  async getMatches(): Promise<Match[]> {
    const response = await api.get<Match[]>('/matches');
    return response.data;
  },

  /**
   * Consulta os detalhes de uma partida específica (incluindo o detalhamento dos 6 duelos)
   */
  async getMatchById(id: number): Promise<Match> {
    const response = await api.get<Match>(`/matches/${id}`);
    return response.data;
  },

  /**
   * Simula uma nova partida entre o clube mandante e o visitante
   */
  async createMatch(data: CreateMatchDTO): Promise<Match> {
    const response = await api.post<Match>('/matches', data);
    return response.data;
  },

  /**
   * Busca a Tabela de Classificação atualizada da liga
   */
  async getStandings(): Promise<Standing[]> {
    const response = await api.get<Standing[]>('/standings');
    return response.data;
  },
};
