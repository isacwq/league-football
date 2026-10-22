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
   * Busca lista paginada de jogadores com suporte a filtros e ordenação.
   *
   * Consome o endpoint `GET /players`, permitindo filtrar por nome, posição,
   * condição física, clube atual e ordenar por overall ou valor de mercado.
   *
   * @param params - Parâmetros opcionais para paginação, busca e ordenação.
   * @returns Promise que resolve com a resposta paginada contendo a lista de jogadores e metadados.
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
   * Busca os detalhes de um jogador pelo ID.
   *
   * Consome o endpoint `GET /players/{id}`, retornando os 6 atributos técnicos,
   * overall, valor de mercado, dados do contrato atual e condição física do atleta.
   *
   * @param id - Identificador único do jogador.
   * @returns Promise que resolve com a ficha completa do jogador.
   */
  async getPlayerById(id: number): Promise<Player> {
    const response = await api.get<Player>(`/players/${id}`);
    return response.data;
  },

  /**
   * Cadastra um novo jogador no mercado/sistema.
   *
   * Consome o endpoint `POST /players`, calculando automaticamente o overall,
   * valor base e valor de mercado a partir dos atributos informados.
   *
   * @param data - Objeto com nome, idade, posição, agilidade e os 6 atributos técnicos.
   * @returns Promise que resolve com o jogador cadastrado e devidamente valorado.
   */
  async createPlayer(data: CreatePlayerDTO): Promise<Player> {
    const response = await api.post<Player>('/players', data);
    return response.data;
  },

  /**
   * Atualiza dados cadastrais do jogador (nome, posição, agilidade, idade).
   *
   * Consome o endpoint `PUT /players/{id}`, permitindo modificar nome, idade,
   * posição tática e agilidade do atleta.
   *
   * @param id - Identificador único do jogador.
   * @param data - Objeto contendo os campos cadastrais a serem atualizados.
   * @returns Promise que resolve com os dados atualizados do jogador.
   */
  async updatePlayer(id: number, data: UpdatePlayerDTO): Promise<Player> {
    const response = await api.put<Player>(`/players/${id}`, data);
    return response.data;
  },

  /**
   * Atualiza a condição física do jogador (APTO, MAL_CONDICIONADO, DOENTE).
   *
   * Consome o endpoint `PATCH /players/{id}/condition`, alterando a condição
   * entre 'APTO', 'MAL_CONDICIONADO' (penalidade de 15% nos duelos) ou 'DOENTE' (não jogável).
   *
   * @param id - Identificador único do jogador.
   * @param data - Objeto contendo o novo status de condição física.
   * @returns Promise que resolve com a ficha do jogador com a condição atualizada.
   */
  async updateCondition(id: number, data: UpdateConditionDTO): Promise<Player> {
    const response = await api.patch<Player>(`/players/${id}/condition`, data);
    return response.data;
  },

  /**
   * Remove um jogador do sistema/mercado.
   *
   * Consome o endpoint `DELETE /players/{id}`. Válido para atletas sem vínculo
   * ou que não estejam com restrições ativas na liga.
   *
   * @param id - Identificador único do jogador a ser removido.
   * @returns Promise que resolve quando a exclusão é concluída com sucesso.
   */
  async deletePlayer(id: number): Promise<void> {
    await api.delete(`/players/${id}`);
  },
};
