package com.github.isacwq.leaguefootball.repositories;

import com.github.isacwq.leaguefootball.entities.ContractEntity;
import com.github.isacwq.leaguefootball.enums.ContractStatus;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractRepository extends JpaRepository<ContractEntity, Long> {

  /**
   * Busca o contrato ativo de um jogador específico.
   */
  Optional<ContractEntity> findByPlayerIdAndStatus(Long playerId, ContractStatus status);
}
