package com.github.isacwq.leaguefootball.repositories;

import com.github.isacwq.leaguefootball.entities.TransactionEntity;
import com.github.isacwq.leaguefootball.enums.TransactionType;
import java.util.List;
import org.jspecify.annotations.Nullable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {

  /**
   * Verifica se um clube já vendeu um determinado jogador anteriormente (impede recompra - RN12).
   */
  boolean existsByClubIdAndPlayerIdAndType(Long clubId, Long playerId, TransactionType type);

  /**
   * Busca as transações de um clube aplicando filtros opcionais de tipo (COMPRA/VENDA) e jogador.
   */
  @Query(
      """
          SELECT t FROM TransactionEntity t
          WHERE t.club.id = :clubId
            AND t.type IN :types
            AND (:playerId IS NULL OR t.player.id = :playerId)
          ORDER BY t.createdAt DESC, t.id DESC
      """)
  List<TransactionEntity> findFiltered(
      @Param("clubId") Long clubId,
      @Param("types") List<TransactionType> types,
      @Nullable @Param("playerId") Long playerId);
}
