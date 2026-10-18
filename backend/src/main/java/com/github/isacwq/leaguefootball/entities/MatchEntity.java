package com.github.isacwq.leaguefootball.entities;

import com.github.isacwq.leaguefootball.enums.MatchResult;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.jspecify.annotations.Nullable;

@Entity
@Table(name = "partidas")
public class MatchEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private @Nullable Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "clube_mandante_id", nullable = false)
  private ClubEntity homeClub;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "clube_visitante_id", nullable = false)
  private ClubEntity awayClub;

  @Column(name = "gols_mandante", nullable = false)
  private Integer homeGoals;

  @Column(name = "gols_visitante", nullable = false)
  private Integer awayGoals;

  @Column(name = "formacao_mandante", nullable = false, length = 10)
  private String homeFormation;

  @Column(name = "formacao_visitante", nullable = false, length = 10)
  private String awayFormation;

  @Enumerated(EnumType.STRING)
  @Column(name = "resultado", nullable = false, length = 15)
  private MatchResult result;

  @Column(name = "realizada_em", nullable = false, updatable = false)
  private OffsetDateTime playedAt = OffsetDateTime.now();

  @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @OrderBy("order ASC")
  private List<MatchDuelEntity> duels = new ArrayList<>();

  public MatchEntity() {}

  public MatchEntity(
      ClubEntity homeClub,
      ClubEntity awayClub,
      Integer homeGoals,
      Integer awayGoals,
      String homeFormation,
      String awayFormation,
      MatchResult result,
      OffsetDateTime playedAt) {
    this.homeClub = homeClub;
    this.awayClub = awayClub;
    this.homeGoals = homeGoals;
    this.awayGoals = awayGoals;
    this.homeFormation = homeFormation;
    this.awayFormation = awayFormation;
    this.result = result;
    this.playedAt = playedAt;
  }

  public @Nullable Long getId() {
    return id;
  }

  public void setId(@Nullable Long id) {
    this.id = id;
  }

  public ClubEntity getHomeClub() {
    return homeClub;
  }

  public void setHomeClub(ClubEntity homeClub) {
    this.homeClub = homeClub;
  }

  public ClubEntity getAwayClub() {
    return awayClub;
  }

  public void setAwayClub(ClubEntity awayClub) {
    this.awayClub = awayClub;
  }

  public Integer getHomeGoals() {
    return homeGoals;
  }

  public void setHomeGoals(Integer homeGoals) {
    this.homeGoals = homeGoals;
  }

  public Integer getAwayGoals() {
    return awayGoals;
  }

  public void setAwayGoals(Integer awayGoals) {
    this.awayGoals = awayGoals;
  }

  public String getHomeFormation() {
    return homeFormation;
  }

  public void setHomeFormation(String homeFormation) {
    this.homeFormation = homeFormation;
  }

  public String getAwayFormation() {
    return awayFormation;
  }

  public void setAwayFormation(String awayFormation) {
    this.awayFormation = awayFormation;
  }

  public MatchResult getResult() {
    return result;
  }

  public void setResult(MatchResult result) {
    this.result = result;
  }

  public OffsetDateTime getPlayedAt() {
    return playedAt;
  }

  public void setPlayedAt(OffsetDateTime playedAt) {
    this.playedAt = playedAt;
  }

  public List<MatchDuelEntity> getDuels() {
    return duels;
  }

  public void setDuels(List<MatchDuelEntity> duels) {
    this.duels = duels;
  }

  public @Nullable Long getWinnerClubId() {
    if (result == MatchResult.MANDANTE) return homeClub.getId();
    if (result == MatchResult.VISITANTE) return awayClub.getId();
    return null;
  }
}
