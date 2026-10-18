package com.github.isacwq.leaguefootball.services.impl;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.github.isacwq.leaguefootball.dtos.UpdateLineupDto;
import com.github.isacwq.leaguefootball.entities.ClubEntity;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Formation;
import com.github.isacwq.leaguefootball.enums.Position;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.repositories.ClubRepository;
import com.github.isacwq.leaguefootball.repositories.LineupRepository;
import com.github.isacwq.leaguefootball.repositories.PlayerRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LineupServiceImplTest {

  @Mock private ClubRepository clubRepository;
  @Mock private PlayerRepository playerRepository;
  @Mock private LineupRepository lineupRepository;

  @InjectMocks private LineupServiceImpl lineupService;

  @Test
  @DisplayName("Deve recusar escalação contendo jogador com condição DOENTE (RN19)")
  void saveLineup_WhenPlayerSick_ThrowsException() {
    ClubEntity club = new ClubEntity();
    club.setId(1L);

    PlayerEntity p1 = createPlayer(1L, Position.GOL, Condition.APTO, club);
    PlayerEntity p2 = createPlayer(2L, Position.ZAG, Condition.DOENTE, club); // DOENTE
    PlayerEntity p3 = createPlayer(3L, Position.ZAG, Condition.APTO, club);
    PlayerEntity p4 = createPlayer(4L, Position.ZAG, Condition.APTO, club);
    PlayerEntity p5 = createPlayer(5L, Position.ATA, Condition.APTO, club);

    List<Long> playerIds = List.of(1L, 2L, 3L, 4L, 5L);

    when(clubRepository.findById(1L)).thenReturn(Optional.of(club));
    when(playerRepository.findAllById(playerIds)).thenReturn(List.of(p1, p2, p3, p4, p5));

    UpdateLineupDto dto = new UpdateLineupDto(Formation.F_3_1, playerIds);

    assertThatThrownBy(() -> lineupService.saveLineup(1L, dto))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("condição DOENTE não pode ser escalado");
  }

  private PlayerEntity createPlayer(Long id, Position pos, Condition cond, ClubEntity club) {
    PlayerEntity p = new PlayerEntity();
    p.setId(id);
    p.setName("Jogador " + id);
    p.setPosition(pos);
    p.setCondition(cond);
    p.setClub(club);
    return p;
  }
}
