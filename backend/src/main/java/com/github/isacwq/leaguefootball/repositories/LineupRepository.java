package com.github.isacwq.leaguefootball.repositories;

import com.github.isacwq.leaguefootball.entities.LineupEntity;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LineupRepository extends JpaRepository<LineupEntity, Long> {

  /**
   * Busca os registros associativos de escalação de um determinado clube.
   */
  List<LineupEntity> findByClubId(Long clubId);

  /**
   * Busca os jogadores titulares de um clube ordenados conforme a regra do elenco (RN11 e RN20):
   * Posição (GOL, ZAG, LAT, MEI, ATA), Nome (alfabético) e ID.
   */
  @Query(
      """
          SELECT l.player FROM LineupEntity l
          WHERE l.club.id = :clubId AND l.player.deletedAt IS NULL
          ORDER BY l.player.position ASC, l.player.name ASC, l.player.id ASC
      """)
  List<PlayerEntity> findLineupEntriesOrdered(@Param("clubId") Long clubId);

  /**
   * Remove todos os titulares da escalação de um clube (utilizado na atualização de escalação RN19).
   */
  @Modifying
  @Query("DELETE FROM LineupEntity l WHERE l.club.id = :clubId")
  void deleteByClubId(@Param("clubId") Long clubId);

  /**
   * Remove um jogador da escalação caso ele passe para a condição DOENTE ou seja vendido.
   */
  @Modifying
  @Query("DELETE FROM LineupEntity l WHERE l.player.id = :playerId")
  void deleteByPlayerId(@Param("playerId") Long playerId);
}
