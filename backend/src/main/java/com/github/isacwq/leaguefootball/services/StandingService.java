package com.github.isacwq.leaguefootball.services;

import com.github.isacwq.leaguefootball.dtos.StandingResponseDto;
import java.util.List;

public interface StandingService {

  /**
   * Gera a tabela de classificação geral da liga com critérios de desempate ordenados (RN21):
   * 1. Pontos (3 p/ vitória, 1 p/ empate, 0 p/ derrota)
   * 2. Saldo de Gols
   * 3. Gols Pró
   * 4. Nome do Clube (alfabético)
   */
  List<StandingResponseDto> getStandings();
}
