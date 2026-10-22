import { api } from './api';
import type {
  Club,
  ClubWithSquad,
  CreateClubDTO,
  Lineup,
  UpdateLineupDTO,
} from '../types';

export const clubService = {
  /**
   * Lista todos os clubes cadastrados na liga futebolística.
   *
   * Consome o endpoint `GET /clubs`, retornando o patrimônio, saldo em caixa,
   * quantidade de atletas e dados cadastrais de cada equipe.
   *
   * @returns Promise que resolve com a lista de clubes cadastrados.
   */
  async getClubs(): Promise<Club[]> {
    const response = await api.get<Club[]>('/clubs');
    return response.data;
  },

  /**
   * Retorna os detalhes completos de um clube específico, incluindo seu elenco.
   *
   * Consome o endpoint `GET /clubs/{id}`, trazendo o saldo em caixa, patrimônio líquido
   * e a lista de jogadores do elenco com seus respectivos contratos de fidelidade.
   *
   * @param id - Identificador único do clube.
   * @returns Promise que resolve com os detalhes do clube e seu elenco de atletas.
   */
  async getClubById(id: number): Promise<ClubWithSquad> {
    const response = await api.get<ClubWithSquad>(`/clubs/${id}`);
    return response.data;
  },

  /**
   * Cadastra um novo clube na liga.
   *
   * Consome o endpoint `POST /clubs`. Cada novo clube é inicializado com
   * um saldo em caixa de R\$ 300,00 e sem atletas no elenco.
   *
   * @param data - Objeto contendo o nome, sigla (3 letras) e URL do escudo do clube.
   * @returns Promise que resolve com os dados do clube recém-criado.
   */
  async createClub(data: CreateClubDTO): Promise<Club> {
    const response = await api.post<Club>('/clubs', data);
    return response.data;
  },

  /**
   * Busca a escalação e formação tática atual do clube.
   *
   * Consome o endpoint `GET /clubs/{clubId}/lineup`, retornando a formação
   * selecionada (3-1, 2-2, 2-1-1 ou 1-2-1) e a lista dos 5 titulares escalados.
   *
   * @param clubId - Identificador único do clube.
   * @returns Promise que resolve com a escalação tática e status de preenchimento.
   */
  async getLineup(clubId: number): Promise<Lineup> {
    const response = await api.get<Lineup>(`/clubs/${clubId}/lineup`);
    return response.data;
  },

  /**
   * Salva a formação tática e define os 5 titulares escalados para o clube.
   *
   * Consome o endpoint `PUT /clubs/{clubId}/lineup`, validando a obrigatoriedade
   * de escalar exatos 5 jogadores para que o clube possa disputar partidas.
   *
   * @param clubId - Identificador único do clube.
   * @param data - Objeto com a formação tática desejada e a lista com o ID dos 5 titulares.
   * @returns Promise que resolve com a escalação tática atualizada.
   */
  async updateLineup(clubId: number, data: UpdateLineupDTO): Promise<Lineup> {
    const response = await api.put<Lineup>(`/clubs/${clubId}/lineup`, data);
    return response.data;
  },
};
