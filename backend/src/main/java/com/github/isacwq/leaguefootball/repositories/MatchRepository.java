package com.github.isacwq.leaguefootball.repositories;

import com.github.isacwq.leaguefootball.entities.MatchEntity;
import java.util.List;
import org.jspecify.annotations.Nullable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchRepository extends JpaRepository<MatchEntity, Long> {

  /**
   * Consulta o histórico de partidas com filtro opcional por clube (RN21).
   *
   * @param clubId ID do clube (opcional). Se for null, retorna todas as partidas.
   *               Se informado, filtra jogos onde o clube foi mandante ou visitante.
   * @return Lista de partidas ordenada da mais recente para a mais antiga (playedAt DESC, id DESC).
   */
  @Query(
      """
          SELECT m FROM MatchEntity m
          WHERE (:clubId IS NULL OR m.homeClub.id = :clubId OR m.awayClub.id = :clubId)
          ORDER BY m.playedAt DESC, m.id DESC
      """)
  List<MatchEntity> findAllFiltered(@Nullable @Param("clubId") Long clubId);
}
