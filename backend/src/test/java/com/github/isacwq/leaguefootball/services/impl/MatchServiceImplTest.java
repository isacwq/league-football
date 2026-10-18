package com.github.isacwq.leaguefootball.services.impl;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.github.isacwq.leaguefootball.dtos.CreateMatchDto;
import com.github.isacwq.leaguefootball.exceptions.InvalidParameterException;
import com.github.isacwq.leaguefootball.repositories.ClubRepository;
import com.github.isacwq.leaguefootball.repositories.LineupRepository;
import com.github.isacwq.leaguefootball.repositories.MatchDuelRepository;
import com.github.isacwq.leaguefootball.repositories.MatchRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MatchServiceImplTest {

  @Mock private ClubRepository clubRepository;
  @Mock private LineupRepository lineupRepository;
  @Mock private MatchRepository matchRepository;
  @Mock private MatchDuelRepository matchDuelRepository;

  @InjectMocks private MatchServiceImpl matchService;

  @Test
  @DisplayName("Deve recusar partida onde o clube mandante é igual ao visitante (RN20)")
  void playMatch_WhenSameClub_ThrowsException() {
    CreateMatchDto dto = new CreateMatchDto(1L, 1L); // IDs iguais

    assertThatThrownBy(() -> matchService.playMatch(dto))
        .isInstanceOf(InvalidParameterException.class)
        .hasMessageContaining("não pode ser igual ao clube visitante");
  }
}
