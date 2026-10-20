import { api } from './api';
import {
  Club,
  ClubWithSquad,
  CreateClubDTO,
  Lineup,
  UpdateLineupDTO,
} from '../types';

export const clubService = {
  /**
   * Lista todos os clubes cadastrados na liga
   */
  async getClubs(): Promise<Club[]> {
    const response = await api.get<Club[]>('/clubs');
    return response.data;
  },

  /**
   * Retorna os detalhes do clube incluindo os jogadores do seu elenco
   */
  async getClubById(id: number): Promise<ClubWithSquad> {
    const response = await api.get<ClubWithSquad>(`/clubs/${id}`);
    return response.data;
  },

  /**
   * Cadastra um novo clube na liga
   */
  async createClub(data: CreateClubDTO): Promise<Club> {
    const response = await api.post<Club>('/clubs', data);
    return response.data;
  },

  /**
   * Busca a escalação e formação tática atual do clube
   */
  async getLineup(clubId: number): Promise<Lineup> {
    const response = await api.get<Lineup>(`/clubs/${clubId}/lineup`);
    return response.data;
  },

  /**
   * Salva a formação tática e os 5 titulares escalados
   */
  async updateLineup(clubId: number, data: UpdateLineupDTO): Promise<Lineup> {
    const response = await api.put<Lineup>(`/clubs/${clubId}/lineup`, data);
    return response.data;
  },
};
