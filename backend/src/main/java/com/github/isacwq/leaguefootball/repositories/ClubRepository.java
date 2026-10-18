package com.github.isacwq.leaguefootball.repositories;

import com.github.isacwq.leaguefootball.entities.ClubEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubRepository extends JpaRepository<ClubEntity, Long> {

  /**
   * Verifica se já existe um clube cadastrado com o nome informado (case-insensitive).
   */
  boolean existsByNameIgnoreCase(String name);

  /**
   * Verifica se já existe um clube cadastrado com a sigla informada (case-insensitive).
   */
  boolean existsByAcronymIgnoreCase(String acronym);
}
