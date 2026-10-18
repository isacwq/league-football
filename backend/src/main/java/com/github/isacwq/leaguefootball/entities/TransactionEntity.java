package com.github.isacwq.leaguefootball.entities;

import com.github.isacwq.leaguefootball.enums.TransactionType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.jspecify.annotations.Nullable;

@Entity
@Table(name = "transacoes")
public class TransactionEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private @Nullable Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "clube_id", nullable = false)
  private ClubEntity club;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "jogador_id", nullable = false)
  private PlayerEntity player;

  @Column(name = "nome_jogador", nullable = false, length = 100)
  private String playerName;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo", nullable = false, length = 10)
  private TransactionType type;

  @Column(name = "valor", nullable = false, precision = 12, scale = 2)
  private BigDecimal value;

  @Column(name = "taxa_ou_comissao", nullable = false, precision = 12, scale = 2)
  private BigDecimal fee;

  @Column(name = "multa", nullable = false, precision = 12, scale = 2)
  private BigDecimal penalty;

  @Column(name = "lucro", precision = 12, scale = 2)
  private @Nullable BigDecimal profit;

  @Column(name = "variacao_caixa", nullable = false, precision = 12, scale = 2)
  private BigDecimal cashChange;

  @Column(name = "criado_em", nullable = false, updatable = false)
  private OffsetDateTime createdAt = OffsetDateTime.now();

  public TransactionEntity() {}

  public TransactionEntity(
      ClubEntity club,
      PlayerEntity player,
      String playerName,
      TransactionType type,
      BigDecimal value,
      BigDecimal fee,
      BigDecimal penalty,
      @Nullable BigDecimal profit,
      BigDecimal cashChange,
      OffsetDateTime createdAt) {
    this.club = club;
    this.player = player;
    this.playerName = playerName;
    this.type = type;
    this.value = value;
    this.fee = fee;
    this.penalty = penalty;
    this.profit = profit;
    this.cashChange = cashChange;
    this.createdAt = createdAt;
  }

  public @Nullable Long getId() {
    return id;
  }

  public void setId(@Nullable Long id) {
    this.id = id;
  }

  public ClubEntity getClub() {
    return club;
  }

  public void setClub(ClubEntity club) {
    this.club = club;
  }

  public PlayerEntity getPlayer() {
    return player;
  }

  public void setPlayer(PlayerEntity player) {
    this.player = player;
  }

  public String getPlayerName() {
    return playerName;
  }

  public void setPlayerName(String playerName) {
    this.playerName = playerName;
  }

  public TransactionType getType() {
    return type;
  }

  public void setType(TransactionType type) {
    this.type = type;
  }

  public BigDecimal getValue() {
    return value;
  }

  public void setValue(BigDecimal value) {
    this.value = value;
  }

  public BigDecimal getFee() {
    return fee;
  }

  public void setFee(BigDecimal fee) {
    this.fee = fee;
  }

  public BigDecimal getPenalty() {
    return penalty;
  }

  public void setPenalty(BigDecimal penalty) {
    this.penalty = penalty;
  }

  public @Nullable BigDecimal getProfit() {
    return profit;
  }

  public void setProfit(@Nullable BigDecimal profit) {
    this.profit = profit;
  }

  public BigDecimal getCashChange() {
    return cashChange;
  }

  public void setCashChange(BigDecimal cashChange) {
    this.cashChange = cashChange;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }
}
