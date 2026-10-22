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
      `/players/${playerId}/sell`
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

  /**
   * Exporta o histórico de transações financeiras de um clube em arquivo CSV.
   *
   * Consome diretamente o endpoint oficial da API `GET /clubs/{id}/transactions/export`,
   * retornando os dados no formato `Blob` para download no navegador.
   *
   * @param clubId - ID do clube cujas transações serão exportadas.
   * @param params - Filtros opcionais de tipo de operação ('COMPRA' | 'VENDA') e atleta.
   * @returns Promise que resolve com o Blob do arquivo CSV gerado pelo backend.
   */
  async exportTransactionsCSV(
    clubId: number,
    params?: TransactionQueryParams
  ): Promise<Blob> {
    const response = await api.get<Blob>(
      `/clubs/${clubId}/transactions/export`,
      {
        params,
        responseType: 'blob',
      }
    );
    return response.data;
  },
};
