package com.github.isacwq.leaguefootball.repositories;

import com.github.isacwq.leaguefootball.entities.MatchDuelEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchDuelRepository extends JpaRepository<MatchDuelEntity, Long> {

  /**
   * Busca os 6 duelos de uma partida ordenados de 1 a 6.
   */
  List<MatchDuelEntity> findByMatchIdOrderByOrderAsc(Long matchId);
}
