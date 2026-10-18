package com.github.isacwq.leaguefootball.services.impl;

import com.github.isacwq.leaguefootball.dtos.*;
import com.github.isacwq.leaguefootball.entities.ClubEntity;
import com.github.isacwq.leaguefootball.entities.MatchDuelEntity;
import com.github.isacwq.leaguefootball.entities.MatchEntity;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.MatchAttribute;
import com.github.isacwq.leaguefootball.enums.MatchResult;
import com.github.isacwq.leaguefootball.enums.Position;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.InvalidParameterException;
import com.github.isacwq.leaguefootball.exceptions.ResourceNotFoundException;
import com.github.isacwq.leaguefootball.repositories.ClubRepository;
import com.github.isacwq.leaguefootball.repositories.LineupRepository;
import com.github.isacwq.leaguefootball.repositories.MatchDuelRepository;
import com.github.isacwq.leaguefootball.repositories.MatchRepository;
import com.github.isacwq.leaguefootball.services.MatchService;
import java.time.OffsetDateTime;
import java.util.*;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementação da simulação de partidas, cálculo dos 6 duelos táticos e histórico de confrontos.
 */
@Service
public class MatchServiceImpl implements MatchService {

  private final ClubRepository clubRepository;
  private final LineupRepository lineupRepository;
  private final MatchRepository matchRepository;
  private final MatchDuelRepository matchDuelRepository;

  public MatchServiceImpl(
      ClubRepository clubRepository,
      LineupRepository lineupRepository,
      MatchRepository matchRepository,
      MatchDuelRepository matchDuelRepository) {
    this.clubRepository = clubRepository;
    this.lineupRepository = lineupRepository;
    this.matchRepository = matchRepository;
    this.matchDuelRepository = matchDuelRepository;
  }

  @Override
  @Transactional // Atômico: grava a partida e os 6 duelos determinísticos [4, 5]
  public MatchDetailResponseDto playMatch(CreateMatchDto dto) {
    if (dto.homeClubId().equals(dto.awayClubId())) {
      throw new InvalidParameterException(
          "O clube mandante não pode ser igual ao clube visitante."); // RN20 [35]
    }

    ClubEntity homeClub =
        clubRepository
            .findById(dto.homeClubId())
            .orElseThrow(() -> new ResourceNotFoundException("Clube mandante não encontrado."));
    ClubEntity awayClub =
        clubRepository
            .findById(dto.awayClubId())
            .orElseThrow(() -> new ResourceNotFoundException("Clube visitante não encontrado."));

    List<PlayerEntity> homeTitulares = lineupRepository.findLineupEntriesOrdered(homeClub.getId());
    List<PlayerEntity> awayTitulares = lineupRepository.findLineupEntriesOrdered(awayClub.getId());

    if (homeTitulares.size() < 5 || awayTitulares.size() < 5) {
      throw new BusinessRuleException(
          "Um dos clubes não possui escalação completa com 5 titulares."); // RN20 [35]
    }

    // Executa os 6 Duelos Determinísticos [36, 37]
    List<MatchDuelEntity> duels = new ArrayList<>();
    int homeGoals = 0, awayGoals = 0;

    // Duelos 1 a 3: Mandante ataca / Visitante defende [36, 37]
    homeGoals +=
        runDuel(
            1,
            homeClub,
            homeTitulares.get(4),
            awayTitulares.get(0),
            duels); // 4º de linha vs GOL [37]
    homeGoals +=
        runDuel(
            2,
            homeClub,
            homeTitulares.get(3),
            awayTitulares.get(1),
            duels); // 3º vs 1º de linha [37]
    homeGoals +=
        runDuel(
            3,
            homeClub,
            homeTitulares.get(2),
            awayTitulares.get(2),
            duels); // 2º vs 2º de linha [37]

    // Duelos 4 a 6: Visitante ataca / Mandante defende [36, 37]
    awayGoals += runDuel(4, awayClub, awayTitulares.get(4), homeTitulares.get(0), duels);
    awayGoals += runDuel(5, awayClub, awayTitulares.get(3), homeTitulares.get(1), duels);
    awayGoals += runDuel(6, awayClub, awayTitulares.get(2), homeTitulares.get(2), duels);

    MatchResult result =
        homeGoals > awayGoals
            ? MatchResult.MANDANTE
            : (awayGoals > homeGoals ? MatchResult.VISITANTE : MatchResult.EMPATE);

    MatchEntity match =
        new MatchEntity(
            homeClub,
            awayClub,
            homeGoals,
            awayGoals,
            homeClub.getFormation(),
            awayClub.getFormation(),
            result,
            OffsetDateTime.now());
    MatchEntity savedMatch = matchRepository.save(match);

    duels.forEach(d -> d.setMatch(savedMatch));
    matchDuelRepository.saveAll(duels);
    List<MatchDuelEntity> savedDuels = matchDuelRepository.saveAll(duels);
    savedMatch.setDuels(savedDuels);

    return findById(savedMatch.getId());
  }

  private int runDuel(
      int order,
      ClubEntity attackerClub,
      PlayerEntity attacker,
      PlayerEntity defender,
      List<MatchDuelEntity> duels) {
    // Aplicação do desconto de 15% para jogador MAL_CONDICIONADO [38]
    int attValue = getAttackerValue(attacker);
    int defValue = getDefenderValue(defender);

    boolean goal = attValue > defValue; // Gol se ataque > defesa (empate não é gol) [39]

    MatchDuelEntity duel = new MatchDuelEntity();
    duel.setOrder(order);
    duel.setAttackingClub(attackerClub);
    duel.setAttacker(attacker);
    duel.setDefender(defender);
    duel.setAttackerName(attacker.getName());
    duel.setDefenderName(defender.getName());
    duel.setAttackerPosition(attacker.getPosition());
    duel.setDefenderPosition(defender.getPosition());
    duel.setAttackerCondition(attacker.getCondition());
    duel.setDefenderCondition(defender.getCondition());
    duel.setAttackAttribute(getAttackAttr(attacker.getPosition()));
    duel.setDefenseAttribute(MatchAttribute.DEFENDING);
    duel.setAttackValue(attValue);
    duel.setDefenseValue(defValue);
    duel.setGoal(goal);

    duels.add(duel);
    return goal ? 1 : 0;
  }

  private int getAttackerValue(PlayerEntity p) {
    int raw =
        switch (p.getPosition()) {
          case ATA -> p.getShooting();
          case MEI -> p.getPassing();
          case ZAG, LAT -> p.getDribbling();
          default -> p.getDefending();
        };
    return p.getCondition() == Condition.MAL_CONDICIONADO
        ? (int) Math.round(raw * 0.85)
        : raw; // RN20 [38]
  }

  private int getDefenderValue(PlayerEntity p) {
    int raw = p.getDefending();
    return p.getCondition() == Condition.MAL_CONDICIONADO
        ? (int) Math.round(raw * 0.85)
        : raw; // RN20 [38]
  }

  private MatchAttribute getAttackAttr(Position pos) {
    return switch (pos) {
      case ATA -> MatchAttribute.SHOOTING;
      case MEI -> MatchAttribute.PASSING;
      case ZAG, LAT -> MatchAttribute.DRIBBLING;
      default -> MatchAttribute.DEFENDING;
    };
  }

  @Override
  @Transactional(readOnly = true)
  public MatchDetailResponseDto findById(Long id) {
    MatchEntity m =
        matchRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Partida não encontrada."));
    var duelDtos = m.getDuels().stream().map(this::mapDuelToDto).toList();
    return new MatchDetailResponseDto(
        m.getId(),
        m.getPlayedAt(),
        new MatchClubSummaryDto(
            m.getHomeClub().getId(),
            m.getHomeClub().getName(),
            m.getHomeClub().getAcronym(),
            m.getHomeGoals()),
        new MatchClubSummaryDto(
            m.getAwayClub().getId(),
            m.getAwayClub().getName(),
            m.getAwayClub().getAcronym(),
            m.getAwayGoals()),
        m.getWinnerClubId(),
        m.getResult(),
        duelDtos);
  }

  @Override
  public List<MatchSimpleResponseDto> findAll(@Nullable Long clubId) {
    return matchRepository.findAllFiltered(clubId).stream()
        .map(
            m ->
                new MatchSimpleResponseDto(
                    m.getId(),
                    m.getPlayedAt(),
                    m.getHomeClub().getId(),
                    m.getHomeClub().getName(),
                    m.getHomeGoals(),
                    m.getAwayClub().getId(),
                    m.getAwayClub().getName(),
                    m.getAwayGoals(),
                    m.getResult()))
        .toList();
  }

  private MatchDuelResponseDto mapDuelToDto(MatchDuelEntity d) {
    String winner = d.isGoal() ? "HOME" : "DRAW";
    return new MatchDuelResponseDto(
        d.getOrder(),
        d.getAttackAttribute(),
        new DuelPlayerDto(
            d.getAttacker().getId(),
            d.getAttackerName(),
            d.getAttackerPosition(),
            d.getAttackValue(),
            d.getAttackerCondition()),
        new DuelPlayerDto(
            d.getDefender().getId(),
            d.getDefenderName(),
            d.getDefenderPosition(),
            d.getDefenseValue(),
            d.getDefenderCondition()),
        winner);
  }
}
