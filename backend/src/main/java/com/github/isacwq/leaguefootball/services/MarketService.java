package com.github.isacwq.leaguefootball.services;

import com.github.isacwq.leaguefootball.dtos.BuyPlayerDto;
import com.github.isacwq.leaguefootball.dtos.BuyTransactionResponseDto;
import com.github.isacwq.leaguefootball.dtos.SellTransactionResponseDto;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;

public interface MarketService {

  /**
   * Executa a compra de um jogador livre por um clube com contrato de fidelidade (RN12-RN14).
   * @throws BusinessRuleException se o clube não tiver saldo suficiente, ultrapassar limite de 50%
   *                               do caixa ou o jogador já tiver clube (HTTP 409)
   */
  BuyTransactionResponseDto buyPlayer(Long playerId, BuyPlayerDto dto);

  /**
   * Executa a venda de um jogador do clube atual para o mercado livre (RN15-RN16).
   * @throws BusinessRuleException se o jogador for livre ou se a multa por rescisão antecipada
   *                               exceder o caixa do clube (HTTP 409)
   */
  SellTransactionResponseDto sellPlayer(Long playerId);
}
