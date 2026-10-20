import { api } from './api';
import type {
  Player,
  CreatePlayerDTO,
  UpdatePlayerDTO,
  UpdateConditionDTO,
  PlayerQueryParams,
  PaginatedResponse,
} from '../types';

export const playerService = {
  /**
   * Busca lista paginada de jogadores com suporte a filtros e ordenação
   */
  async getPlayers(
    params?: PlayerQueryParams
  ): Promise<PaginatedResponse<Player>> {
    const response = await api.get<PaginatedResponse<Player>>('/players', {
      params,
    });
    return response.data;
  },

  /**
   * Busca os detalhes de um jogador pelo ID
   */
  async getPlayerById(id: number): Promise<Player> {
    const response = await api.get<Player>(`/players/${id}`);
    return response.data;
  },

  /**
   * Cadastra um novo jogador no mercado/sistema
   */
  async createPlayer(data: CreatePlayerDTO): Promise<Player> {
    const response = await api.post<Player>('/players', data);
    return response.data;
  },

  /**
   * Atualiza dados cadastrais do jogador (nome, posição, agilidade, idade)
   */
  async updatePlayer(id: number, data: UpdatePlayerDTO): Promise<Player> {
    const response = await api.put<Player>(`/players/${id}`, data);
    return response.data;
  },

  /**
   * Atualiza a condição física do jogador (APTO, MAL_CONDICIONADO, DOENTE)
   */
  async updateCondition(id: number, data: UpdateConditionDTO): Promise<Player> {
    const response = await api.patch<Player>(`/players/${id}/condition`, data);
    return response.data;
  },

  /**
   * Remove um jogador do sistema
   */
  async deletePlayer(id: number): Promise<void> {
    await api.delete(`/players/${id}`);
  },
};
