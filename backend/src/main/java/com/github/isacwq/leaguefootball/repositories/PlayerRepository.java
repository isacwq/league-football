package com.github.isacwq.leaguefootball.repositories;

import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerRepository
    extends JpaRepository<PlayerEntity, Long>, JpaSpecificationExecutor<PlayerEntity> {

  /**
   * Busca um jogador por ID ignorando registros marcados com exclusão lógica (excluido_em != null).
   */
  Optional<PlayerEntity> findByIdAndDeletedAtIsNull(Long id);

  /**
   * Verifica se existe jogador ativo (não excluído) com determinado ID.
   */
  boolean existsByIdAndDeletedAtIsNull(Long id);
}
