package com.github.isacwq.leaguefootball.entities;

import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.ContractStatus;
import com.github.isacwq.leaguefootball.enums.Position;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.jspecify.annotations.Nullable;

@Entity
@Table(name = "jogadores")
public class PlayerEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private @Nullable Long id;

  @Column(name = "nome", nullable = false, length = 100)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(name = "posicao", nullable = false, length = 10)
  private Position position;

  @Column(name = "agilidade", nullable = false)
  private Integer agility;

  @Column(name = "idade", nullable = false)
  private Integer age;

  @Column(name = "ritmo", nullable = false)
  private Integer pace;

  @Column(name = "chute", nullable = false)
  private Integer shooting;

  @Column(name = "passe", nullable = false)
  private Integer passing;

  @Column(name = "driblar", nullable = false)
  private Integer dribbling;

  @Column(name = "defesa", nullable = false)
  private Integer defending;

  @Column(name = "fisico", nullable = false)
  private Integer physical;

  @Column(name = "potencial", nullable = false)
  private Integer potential;

  @Column(name = "valor_base", nullable = false, precision = 12, scale = 2)
  private BigDecimal baseValue;

  @Enumerated(EnumType.STRING)
  @Column(name = "condicao", nullable = false, length = 20)
  private Condition condition = Condition.APTO;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "clube_id")
  private @Nullable ClubEntity club;

  @Column(name = "excluido_em")
  private @Nullable OffsetDateTime deletedAt;

  @Column(name = "criado_em", nullable = false, updatable = false)
  private OffsetDateTime createdAt = OffsetDateTime.now();

  @OneToMany(mappedBy = "player", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<ContractEntity> contracts = new ArrayList<>();

  public PlayerEntity() {}

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

  public Position getPosition() {
    return position;
  }

  public void setPosition(Position position) {
    this.position = position;
  }

  public Integer getAgility() {
    return agility;
  }

  public void setAgility(Integer agility) {
    this.agility = agility;
  }

  public Integer getAge() {
    return age;
  }

  public void setAge(Integer age) {
    this.age = age;
  }

  public Integer getPace() {
    return pace;
  }

  public void setPace(Integer pace) {
    this.pace = pace;
  }

  public Integer getShooting() {
    return shooting;
  }

  public void setShooting(Integer shooting) {
    this.shooting = shooting;
  }

  public Integer getPassing() {
    return passing;
  }

  public void setPassing(Integer passing) {
    this.passing = passing;
  }

  public Integer getDribbling() {
    return dribbling;
  }

  public void setDribbling(Integer dribbling) {
    this.dribbling = dribbling;
  }

  public Integer getDefending() {
    return defending;
  }

  public void setDefending(Integer defending) {
    this.defending = defending;
  }

  public Integer getPhysical() {
    return physical;
  }

  public void setPhysical(Integer physical) {
    this.physical = physical;
  }

  public Integer getPotential() {
    return potential;
  }

  public void setPotential(Integer potential) {
    this.potential = potential;
  }

  public BigDecimal getBaseValue() {
    return baseValue;
  }

  public void setBaseValue(BigDecimal baseValue) {
    this.baseValue = baseValue;
  }

  public Condition getCondition() {
    return condition;
  }

  public void setCondition(Condition condition) {
    this.condition = condition;
  }

  public @Nullable ClubEntity getClub() {
    return club;
  }

  public void setClub(@Nullable ClubEntity club) {
    this.club = club;
  }

  public @Nullable OffsetDateTime getDeletedAt() {
    return deletedAt;
  }

  public void setDeletedAt(@Nullable OffsetDateTime deletedAt) {
    this.deletedAt = deletedAt;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public List<ContractEntity> getContracts() {
    return contracts;
  }

  public void setContracts(List<ContractEntity> contracts) {
    this.contracts = contracts;
  }

  public @Nullable ContractEntity getActiveContract() {
    return contracts.stream()
        .filter(c -> c.getStatus() == ContractStatus.ATIVO)
        .findFirst()
        .orElse(null);
  }
}
