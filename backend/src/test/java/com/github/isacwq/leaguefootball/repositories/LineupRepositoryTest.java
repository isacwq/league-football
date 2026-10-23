package com.github.isacwq.leaguefootball.repositories;

import static org.assertj.core.api.Assertions.assertThat;

import com.github.isacwq.leaguefootball.entities.ClubEntity;
import com.github.isacwq.leaguefootball.entities.LineupEntity;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Position;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

@DataJpaTest
class LineupRepositoryTest {

  @Autowired private TestEntityManager entityManager;
  @Autowired private LineupRepository lineupRepository;

  @Test
  @DisplayName(
      "Deve ordenar os titulares por hierarquia tática (GOL, ZAG, LAT, MEI, ATA), nome e ID"
          + " (RN11/RN20)")
  void findLineupEntriesOrdered_ShouldReturnPlayersInTacticalPositionOrder() {
    ClubEntity club = new ClubEntity();
    club.setName("Clube Teste");
    club.setAcronym("CLU");
    club = entityManager.persistAndFlush(club);

    PlayerEntity ata = createPlayer("Carlos Ata", Position.ATA, club);
    PlayerEntity mei = createPlayer("Bruno Mei", Position.MEI, club);
    PlayerEntity lat = createPlayer("Daniel Lat", Position.LAT, club);
    PlayerEntity zag = createPlayer("Arthur Zag", Position.ZAG, club);
    PlayerEntity gol = createPlayer("Alan Gol", Position.GOL, club);

    entityManager.persist(new LineupEntity(club, ata));
    entityManager.persist(new LineupEntity(club, mei));
    entityManager.persist(new LineupEntity(club, lat));
    entityManager.persist(new LineupEntity(club, zag));
    entityManager.persist(new LineupEntity(club, gol));
    entityManager.flush();

    List<PlayerEntity> orderedPlayers = lineupRepository.findLineupEntriesOrdered(club.getId());

    assertThat(orderedPlayers).hasSize(5);
    assertThat(orderedPlayers.get(0).getPosition()).isEqualTo(Position.GOL);
    assertThat(orderedPlayers.get(1).getPosition()).isEqualTo(Position.ZAG);
    assertThat(orderedPlayers.get(2).getPosition()).isEqualTo(Position.LAT);
    assertThat(orderedPlayers.get(3).getPosition()).isEqualTo(Position.MEI);
    assertThat(orderedPlayers.get(4).getPosition()).isEqualTo(Position.ATA);
  }

  private PlayerEntity createPlayer(String name, Position position, ClubEntity club) {
    PlayerEntity p = new PlayerEntity();
    p.setName(name);
    p.setPosition(position);
    p.setAgility(80);
    p.setAge(22);
    p.setPace(70);
    p.setShooting(70);
    p.setPassing(70);
    p.setDribbling(70);
    p.setDefending(70);
    p.setPhysical(70);
    p.setPotential(80);
    p.setBaseValue(BigDecimal.valueOf(50.00));
    p.setCondition(Condition.APTO);
    p.setClub(club);
    return entityManager.persist(p);
  }
}
