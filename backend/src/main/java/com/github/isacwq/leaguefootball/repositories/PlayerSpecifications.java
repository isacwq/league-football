package com.github.isacwq.leaguefootball.repositories;

import com.github.isacwq.leaguefootball.dtos.PlayerFilterParamsDto;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public class PlayerSpecifications {

  public static Specification<PlayerEntity> buildFilter(PlayerFilterParamsDto f) {
    return (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();

      // Filtro de elegibilidade: considera apenas atletas ativos cadastrados no sistema.
      predicates.add(cb.isNull(root.get("deletedAt")));

      // Pesquisa por nome do atleta ou do clube vinculado.
      if (f.search() != null && !f.search().trim().isEmpty()) {
        String searchTerm = "%" + f.search().trim().toLowerCase() + "%";
        Predicate nameLike = cb.like(cb.lower(root.get("name")), searchTerm);
        Predicate clubNameLike = cb.like(cb.lower(root.join("club").get("name")), searchTerm);
        predicates.add(cb.or(nameLike, clubNameLike));
      }

      // Filtragem por setor tático em campo e estado médico.
      if (f.position() != null) {
        predicates.add(cb.equal(root.get("position"), f.position()));
      }
      if (f.condition() != null) {
        predicates.add(cb.equal(root.get("condition"), f.condition()));
      }

      // Seleção por atletas sem vínculo (livres) ou alocados em clube específico.
      if (Boolean.TRUE.equals(f.free())) {
        predicates.add(cb.isNull(root.get("club")));
      } else if (f.clubId() != null) {
        predicates.add(cb.equal(root.get("club").get("id"), f.clubId()));
      }

      // Filtro por faixa etária mínima e máxima.
      if (f.minAge() != null) {
        predicates.add(cb.greaterThanOrEqualTo(root.get("age"), f.minAge()));
      }
      if (f.maxAge() != null) {
        predicates.add(cb.lessThanOrEqualTo(root.get("age"), f.maxAge()));
      }

      // Faixa de Valor Base / Mercado
      if (f.minValue() != null) {
        predicates.add(cb.greaterThanOrEqualTo(root.get("baseValue"), f.minValue()));
      }
      if (f.maxValue() != null) {
        predicates.add(cb.lessThanOrEqualTo(root.get("baseValue"), f.maxValue()));
      }

      return cb.and(predicates.toArray(new Predicate[0]));
    };
  }
}
