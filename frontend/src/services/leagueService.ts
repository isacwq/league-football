import { api } from './api';
import type { Match, CreateMatchDTO, Standing } from '../types';

export const leagueService = {
  /**
   * Lista todas as partidas já simuladas na liga.
   *
   * Consome o endpoint `GET /matches`, retornando o histórico completo de confrontos,
   * placares finais e clubes envolvidos ordenados cronologicamente.
   *
   * @returns Promise que resolve com a lista de partidas realizadas na competição.
   */
  async getMatches(): Promise<Match[]> {
    const response = await api.get<Match[]>('/matches');
    return response.data;
  },

  /**
   * Consulta os detalhes completos de uma partida específica (incluindo o detalhamento dos 6 duelos).
   *
   * Consome o endpoint `GET /matches/{id}`, fornecendo o resultado detalhado dos 6 duelos
   * táticos por posição entre os atletas mandantes e visitantes durante o confronto.
   *
   * @param id - Identificador único da partida.
   * @returns Promise que resolve com os detalhes completos da partida e seus duelos.
   */
  async getMatchById(id: number): Promise<Match> {
    const response = await api.get<Match>(`/matches/${id}`);
    return response.data;
  },

  /**
   * Simula uma nova partida entre o clube mandante e o visitante.
   *
   * Consome o endpoint `POST /matches`, executando os duelos determinísticos por atributos
   * entre os 5 titulares escalados de cada equipe e atualizando a pontuação geral.
   *
   * @param data - Objeto contendo os IDs do clube mandante e do clube visitante.
   * @returns Promise que resolve com os dados e placar final da partida simulada.
   */
  async createMatch(data: CreateMatchDTO): Promise<Match> {
    const response = await api.post<Match>('/matches', data);
    return response.data;
  },

  /**
   * Busca a Tabela de Classificação atualizada da liga.
   *
   * Consome o endpoint `GET /standings`, calculando pontos (3 por vitória, 1 por empate),
   * vitórias, saldo de gols, gols pró e posição ranqueada de cada clube.
   *
   * @returns Promise que resolve com a tabela de classificação oficial da liga.
   */
  async getStandings(): Promise<Standing[]> {
    const response = await api.get<Standing[]>('/standings');
    return response.data;
  },
};
