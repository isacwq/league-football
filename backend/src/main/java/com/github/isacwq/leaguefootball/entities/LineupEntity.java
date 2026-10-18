package com.github.isacwq.leaguefootball.entities;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import org.jspecify.annotations.Nullable;

@Entity
@Table(
    name = "escalacoes",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"clube_id", "jogador_id"})})
public class LineupEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private @Nullable Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "clube_id", nullable = false)
  private ClubEntity club;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "jogador_id", nullable = false)
  private PlayerEntity player;

  @Column(name = "criado_em", nullable = false, updatable = false)
  private OffsetDateTime createdAt = OffsetDateTime.now();

  public LineupEntity() {}

  public LineupEntity(ClubEntity club, PlayerEntity player) {
    this.club = club;
    this.player = player;
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

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }
}
