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
   * Realiza a compra de um jogador por um clube no mercado de transferências.
   *
   * @param playerId - ID do jogador a ser comprado.
   * @param data - Objeto contendo club_id e player_id.
   * @returns Dados da transação de compra concluída.
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
   * Realiza a venda/rescisão do contrato de um jogador de um clube.
   *
   * @param playerId - ID do jogador a ser vendido.
   * @returns Dados da transação de venda e alteração no caixa do clube.
   */
  async sellPlayer(playerId: number): Promise<SellTransactionResponse> {
    const response = await api.post<SellTransactionResponse>(
      `/players/${playerId}/sell`
    );
    return response.data;
  },

  /**
   * Busca o histórico de transações de um clube com suporte a filtros.
   *
   * @param clubId - ID do clube para consulta do histórico.
   * @param params - Filtros opcionais (tipo de operação 'COMPRA' | 'VENDA', player_id).
   * @returns Resposta contendo a lista de transações e o resumo financeiro.
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
