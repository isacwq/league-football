package com.github.isacwq.leaguefootball.services;

import com.github.isacwq.leaguefootball.dtos.CreateMatchDto;
import com.github.isacwq.leaguefootball.dtos.MatchDetailResponseDto;
import com.github.isacwq.leaguefootball.dtos.MatchSimpleResponseDto;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import java.util.List;

public interface MatchService {

  /**
   * Simula o confronto entre dois clubes através do cálculo dos 6 duelos determinísticos (RN20).
   * @throws BusinessRuleException se algum dos clubes não tiver escalação válida e completa (HTTP 409)
   */
  MatchDetailResponseDto playMatch(CreateMatchDto dto);

  /**
   * Lista o histórico de partidas realizadas na liga com filtro opcional por clube.
   */
  List<MatchSimpleResponseDto> findAll(Long clubId);

  /**
   * Consulta os detalhes de uma partida e o resultado individual dos 6 duelos (RN21).
   */
  MatchDetailResponseDto findById(Long id);
}
