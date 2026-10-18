package com.github.isacwq.leaguefootball.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.jspecify.annotations.Nullable;

@Entity
@Table(name = "clubes")
public class ClubEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private @Nullable Long id;

  @Column(name = "nome", nullable = false, unique = true, length = 60)
  private String name;

  @Column(name = "sigla", nullable = false, unique = true, length = 3)
  private String acronym;

  @Column(name = "caixa", nullable = false, precision = 12, scale = 2)
  private BigDecimal cash = BigDecimal.valueOf(300.00);

  @Column(name = "formacao", length = 10)
  private @Nullable String formation;

  @OneToMany(mappedBy = "club", fetch = FetchType.LAZY)
  private List<PlayerEntity> players = new ArrayList<>();

  @Column(name = "criado_em", nullable = false, updatable = false)
  private OffsetDateTime createdAt = OffsetDateTime.now();

  public ClubEntity() {}

  public @Nullable Long getId() {
    return id;
  }

  public void setId(@Nullable Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getAcronym() {
    return acronym;
  }

  public void setAcronym(String acronym) {
    this.acronym = acronym;
  }

  public BigDecimal getCash() {
    return cash;
  }

  public void setCash(BigDecimal cash) {
    this.cash = cash;
  }

  public @Nullable String getFormation() {
    return formation;
  }

  public void setFormation(@Nullable String formation) {
    this.formation = formation;
  }

  public List<PlayerEntity> getPlayers() {
    return players;
  }

  public void setPlayers(List<PlayerEntity> players) {
    this.players = players;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }
}
