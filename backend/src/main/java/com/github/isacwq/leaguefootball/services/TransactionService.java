package com.github.isacwq.leaguefootball.services;

import com.github.isacwq.leaguefootball.dtos.TransactionHistoryResponseDto;
import org.jspecify.annotations.Nullable;

public interface TransactionService {

  /**
   * Retorna a lista de transações de um clube com filtros e o resumo de totais acumulados (RN17).
   */
  TransactionHistoryResponseDto findTransactions(
      Long clubId, @Nullable String type, @Nullable Long playerId);

  /**
   * Gera o conteúdo do arquivo CSV formatado em UTF-8 e delimitado por ponto e vírgula (RN18).
   * Cabeçalho: data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa
   */
  String generateCsv(Long clubId, @Nullable String type, @Nullable Long playerId);
}
