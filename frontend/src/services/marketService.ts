import { api } from './api';
import type {
  BuyPlayerDTO,
  BuyTransactionResponse,
  SellTransactionResponse,
  TransactionHistoryResponse,
  TransactionQueryParams,
} from '../types';

export const marketService = {
  /**
   * Realiza a compra de um jogador por um clube com definição da fidelidade contratual
   */
  async buyPlayer(
    playerId: number,
    data: BuyPlayerDTO
  ): Promise<BuyTransactionResponse> {
    const response = await api.post<BuyTransactionResponse>(
      `/players/${playerId}/buy`,
      data
    );
    return response.data;
  },

  /**
   * Realiza a venda de um jogador pertencente ao clube
   */
  async sellPlayer(playerId: number): Promise<SellTransactionResponse> {
    const response = await api.post<SellTransactionResponse>(
      `/market/sell/${playerId}`
    );
    return response.data;
  },

  /**
   * Consulta o histórico detalhado de transações financeiras de um clube
   */
  async getTransactions(
    clubId: number,
    params?: TransactionQueryParams
  ): Promise<TransactionHistoryResponse> {
    const response = await api.get<TransactionHistoryResponse>(
      `/clubs/${clubId}/transactions`,
      { params }
    );
    return response.data;
  },
};
