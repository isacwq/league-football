package com.github.isacwq.leaguefootball.services;

import com.github.isacwq.leaguefootball.dtos.LineupResponseDto;
import com.github.isacwq.leaguefootball.dtos.UpdateLineupDto;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;

public interface LineupService {

  /**
   * Define ou atualiza a formação tática e seleciona os 5 jogadores titulares do clube (RN19).
   * @throws BusinessRuleException se os jogadores não pertencerem ao clube, não estiverem APTOS
   *                               ou a formação exigir posições incompatíveis (HTTP 409)
   */
  LineupResponseDto saveLineup(Long clubId, UpdateLineupDto dto);

  /**
   * Retorna a escalação cadastrada do clube e indica se está válida para partida.
   */
  LineupResponseDto findByClubId(Long clubId);
}
