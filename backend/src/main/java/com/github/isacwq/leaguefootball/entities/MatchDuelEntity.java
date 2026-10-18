package com.github.isacwq.leaguefootball.entities;

import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.MatchAttribute;
import com.github.isacwq.leaguefootball.enums.Position;
import jakarta.persistence.*;
import org.jspecify.annotations.Nullable;

@Entity
@Table(name = "duelos")
public class MatchDuelEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private @Nullable Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "partida_id", nullable = false)
  private MatchEntity match;

  @Column(name = "ordem", nullable = false)
  private Integer order;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "clube_atacante_id", nullable = false)
  private ClubEntity attackingClub;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "atacante_id", nullable = false)
  private PlayerEntity attacker;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "defensor_id", nullable = false)
  private PlayerEntity defender;

  @Column(name = "nome_atacante", nullable = false, length = 100)
  private String attackerName;

  @Column(name = "nome_defensor", nullable = false, length = 100)
  private String defenderName;

  @Enumerated(EnumType.STRING)
  @Column(name = "posicao_atacante", nullable = false, length = 10)
  private Position attackerPosition;

  @Enumerated(EnumType.STRING)
  @Column(name = "posicao_defensor", nullable = false, length = 10)
  private Position defenderPosition;

  @Enumerated(EnumType.STRING)
  @Column(name = "condicao_atacante", nullable = false, length = 20)
  private Condition attackerCondition;

  @Enumerated(EnumType.STRING)
  @Column(name = "condicao_defensor", nullable = false, length = 20)
  private Condition defenderCondition;

  @Enumerated(EnumType.STRING)
  @Column(name = "atributo_ataque", nullable = false, length = 20)
  private MatchAttribute attackAttribute;

  @Enumerated(EnumType.STRING)
  @Column(name = "atributo_defesa", nullable = false, length = 20)
  private MatchAttribute defenseAttribute;

  @Column(name = "valor_ataque", nullable = false)
  private Integer attackValue;

  @Column(name = "valor_defesa", nullable = false)
  private Integer defenseValue;

  @Column(name = "gol", nullable = false)
  private boolean goal;

  public MatchDuelEntity() {}

  public @Nullable Long getId() {
    return id;
  }

  public void setId(@Nullable Long id) {
    this.id = id;
  }

  public MatchEntity getMatch() {
    return match;
  }

  public void setMatch(MatchEntity match) {
    this.match = match;
  }

  public Integer getOrder() {
    return order;
  }

  public void setOrder(Integer order) {
    this.order = order;
  }

  public ClubEntity getAttackingClub() {
    return attackingClub;
  }

  public void setAttackingClub(ClubEntity attackingClub) {
    this.attackingClub = attackingClub;
  }

  public PlayerEntity getAttacker() {
    return attacker;
  }

  public void setAttacker(PlayerEntity attacker) {
    this.attacker = attacker;
  }

  public PlayerEntity getDefender() {
    return defender;
  }

  public void setDefender(PlayerEntity defender) {
    this.defender = defender;
  }

  public String getAttackerName() {
    return attackerName;
  }

  public void setAttackerName(String attackerName) {
    this.attackerName = attackerName;
  }

  public String getDefenderName() {
    return defenderName;
  }

  public void setDefenderName(String defenderName) {
    this.defenderName = defenderName;
  }

  public Position getAttackerPosition() {
    return attackerPosition;
  }

  public void setAttackerPosition(Position attackerPosition) {
    this.attackerPosition = attackerPosition;
  }

  public Position getDefenderPosition() {
    return defenderPosition;
  }

  public void setDefenderPosition(Position defenderPosition) {
    this.defenderPosition = defenderPosition;
  }

  public Condition getAttackerCondition() {
    return attackerCondition;
  }

  public void setAttackerCondition(Condition attackerCondition) {
    this.attackerCondition = attackerCondition;
  }

  public Condition getDefenderCondition() {
    return defenderCondition;
  }

  public void setDefenderCondition(Condition defenderCondition) {
    this.defenderCondition = defenderCondition;
  }

  public MatchAttribute getAttackAttribute() {
    return attackAttribute;
  }

  public void setAttackAttribute(MatchAttribute attackAttribute) {
    this.attackAttribute = attackAttribute;
  }

  public MatchAttribute getDefenseAttribute() {
    return defenseAttribute;
  }

  public void setDefenseAttribute(MatchAttribute defenseAttribute) {
    this.defenseAttribute = defenseAttribute;
  }

  public Integer getAttackValue() {
    return attackValue;
  }

  public void setAttackValue(Integer attackValue) {
    this.attackValue = attackValue;
  }

  public Integer getDefenseValue() {
    return defenseValue;
  }

  public void setDefenseValue(Integer defenseValue) {
    this.defenseValue = defenseValue;
  }

  public boolean isGoal() {
    return goal;
  }

  public void setGoal(boolean goal) {
    this.goal = goal;
  }
}
