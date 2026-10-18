package com.github.isacwq.leaguefootball.entities;

import com.github.isacwq.leaguefootball.enums.ContractStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.jspecify.annotations.Nullable;

@Entity
@Table(name = "contratos")
public class ContractEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private @Nullable Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "jogador_id", nullable = false)
  private PlayerEntity player;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "clube_id", nullable = false)
  private ClubEntity club;

  @Column(name = "valor_compra", nullable = false, precision = 12, scale = 2)
  private BigDecimal purchaseValue;

  @Column(name = "fidelidade_ate", nullable = false)
  private OffsetDateTime loyaltyUntil;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private ContractStatus status = ContractStatus.ATIVO;

  @Column(name = "inicio_em", nullable = false, updatable = false)
  private OffsetDateTime startAt = OffsetDateTime.now();

  @Column(name = "fim_em")
  private @Nullable OffsetDateTime endAt;

  public ContractEntity() {}

  public ContractEntity(
      PlayerEntity player,
      ClubEntity club,
      BigDecimal purchaseValue,
      OffsetDateTime loyaltyUntil,
      ContractStatus status,
      OffsetDateTime startAt) {
    this.player = player;
    this.club = club;
    this.purchaseValue = purchaseValue;
    this.loyaltyUntil = loyaltyUntil;
    this.status = status;
    this.startAt = startAt;
  }

  public @Nullable Long getId() {
    return id;
  }

  public void setId(@Nullable Long id) {
    this.id = id;
  }

  public PlayerEntity getPlayer() {
    return player;
  }

  public void setPlayer(PlayerEntity player) {
    this.player = player;
  }

  public ClubEntity getClub() {
    return club;
  }

  public void setClub(ClubEntity club) {
    this.club = club;
  }

  public BigDecimal getPurchaseValue() {
    return purchaseValue;
  }

  public void setPurchaseValue(BigDecimal purchaseValue) {
    this.purchaseValue = purchaseValue;
  }

  public OffsetDateTime getLoyaltyUntil() {
    return loyaltyUntil;
  }

  public void setLoyaltyUntil(OffsetDateTime loyaltyUntil) {
    this.loyaltyUntil = loyaltyUntil;
  }

  public ContractStatus getStatus() {
    return status;
  }

  public void setStatus(ContractStatus status) {
    this.status = status;
  }

  public OffsetDateTime getStartAt() {
    return startAt;
  }

  public void setStartAt(OffsetDateTime startAt) {
    this.startAt = startAt;
  }

  public @Nullable OffsetDateTime getEndAt() {
    return endAt;
  }

  public void setEndAt(@Nullable OffsetDateTime endAt) {
    this.endAt = endAt;
  }
}
