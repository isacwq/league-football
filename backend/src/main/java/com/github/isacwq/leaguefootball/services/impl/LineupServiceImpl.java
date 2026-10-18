package com.github.isacwq.leaguefootball.services.impl;

import com.github.isacwq.leaguefootball.dtos.LineupResponseDto;
import com.github.isacwq.leaguefootball.dtos.PlayerResponseDto;
import com.github.isacwq.leaguefootball.dtos.UpdateLineupDto;
import com.github.isacwq.leaguefootball.entities.ClubEntity;
import com.github.isacwq.leaguefootball.entities.LineupEntity;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Formation;
import com.github.isacwq.leaguefootball.enums.Position;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.ResourceNotFoundException;
import com.github.isacwq.leaguefootball.repositories.ClubRepository;
import com.github.isacwq.leaguefootball.repositories.LineupRepository;
import com.github.isacwq.leaguefootball.repositories.PlayerRepository;
import com.github.isacwq.leaguefootball.services.LineupService;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementação do gerenciamento de formações e escalações táticas titulares dos clubes.
 */
@Service
public class LineupServiceImpl implements LineupService {

  private final ClubRepository clubRepository;
  private final PlayerRepository playerRepository;
  private final LineupRepository lineupRepository;
  private final BusinessCalculatorService calculator;

  public LineupServiceImpl(
      ClubRepository clubRepository,
      PlayerRepository playerRepository,
      LineupRepository lineupRepository,
      BusinessCalculatorService calculator) {
    this.clubRepository = clubRepository;
    this.playerRepository = playerRepository;
    this.lineupRepository = lineupRepository;
    this.calculator = calculator;
  }

  @Override
  @Transactional
  public LineupResponseDto saveLineup(Long clubId, UpdateLineupDto dto) {
    ClubEntity club =
        clubRepository
            .findById(clubId)
            .orElseThrow(() -> new ResourceNotFoundException("Clube não encontrado."));

    List<PlayerEntity> players = playerRepository.findAllById(dto.playerIds());
    if (players.size() != 5) {
      throw new ResourceNotFoundException("Um ou mais jogadores informados não foram encontrados.");
    }

    // RN19: Restrição de aptidão física: atletas lesionados ou em tratamento médico (DOENTE) não
    // podem ser escalados.
    for (PlayerEntity p : players) {
      if (p.getClub() == null || !p.getClub().getId().equals(clubId)) {
        throw new BusinessRuleException(
            "O jogador " + p.getName() + " não pertence ao elenco do clube.");
      }
      if (p.getCondition() == Condition.DOENTE) {
        throw new BusinessRuleException("Jogador com condição DOENTE não pode ser escalado.");
      }
    }

    // RN19: Formação tática oficial com 5 titulares (1 GOL e 4 de linha) cobrindo todos os setores
    // exigidos.
    long golCount = players.stream().filter(p -> p.getPosition() == Position.GOL).count();
    long defCount =
        players.stream()
            .filter(p -> p.getPosition() == Position.ZAG || p.getPosition() == Position.LAT)
            .count();
    long meiCount = players.stream().filter(p -> p.getPosition() == Position.MEI).count();
    long ataCount = players.stream().filter(p -> p.getPosition() == Position.ATA).count();

    boolean valid =
        switch (dto.formation()) {
          case F_3_1 -> golCount == 1 && defCount == 3 && meiCount == 0 && ataCount == 1;
          case F_2_2 -> golCount == 1 && defCount == 2 && meiCount == 0 && ataCount == 2;
          case F_2_1_1 -> golCount == 1 && defCount == 2 && meiCount == 1 && ataCount == 1;
          case F_1_2_1 -> golCount == 1 && defCount == 1 && meiCount == 2 && ataCount == 1;
        };

    if (!valid) {
      throw new BusinessRuleException(
          "As posições dos jogadores selecionados não fecham a formação tática "
              + dto.formation().getValue()
              + ".");
    }

    lineupRepository.deleteByClubId(clubId);
    club.setFormation(dto.formation().getValue());
    clubRepository.save(club);

    for (PlayerEntity p : players) {
      lineupRepository.save(new LineupEntity(club, p));
    }

    return findByClubId(clubId);
  }

  @Override
  @Transactional(readOnly = true)
  public LineupResponseDto findByClubId(Long clubId) {
    ClubEntity club =
        clubRepository
            .findById(clubId)
            .orElseThrow(() -> new ResourceNotFoundException("Clube não encontrado."));

    List<LineupEntity> lineupEntries = lineupRepository.findByClubId(clubId);
    boolean isComplete =
        lineupEntries.size() == 5
            && lineupEntries.stream()
                .noneMatch(p -> p.getPlayer().getCondition() == Condition.DOENTE);

    List<PlayerResponseDto> playerDtos =
        lineupEntries.stream()
            .map(l -> l.getPlayer())
            .sorted(
                Comparator.comparing((PlayerEntity p) -> p.getPosition().ordinal())
                    .thenComparing(
                        PlayerEntity::getName, Comparator.nullsLast(String::compareToIgnoreCase))
                    .thenComparing(PlayerEntity::getId))
            .map(this::mapPlayerToDto)
            .toList();
    Formation formation =
        club.getFormation() != null
            ? Formation.valueOf("F_" + club.getFormation().replace('-', '_'))
            : null;

    return new LineupResponseDto(clubId, formation, isComplete, playerDtos);
  }

  private PlayerResponseDto mapPlayerToDto(PlayerEntity p) {
    int overall =
        calculator.calculateOverall(
            p.getPosition(),
            p.getPace(),
            p.getShooting(),
            p.getPassing(),
            p.getDribbling(),
            p.getDefending(),
            p.getPhysical());
    BigDecimal marketValue =
        calculator.calculateMarketValue(
            p.getBaseValue(), p.getCondition(), p.getAgility(), p.getAge());
    return new PlayerResponseDto(
        p.getId(),
        p.getName(),
        p.getPosition(),
        p.getAgility(),
        p.getAge(),
        p.getPace(),
        p.getShooting(),
        p.getPassing(),
        p.getDribbling(),
        p.getDefending(),
        p.getPhysical(),
        p.getPotential(),
        overall,
        p.getBaseValue(),
        marketValue,
        p.getCondition(),
        p.getClub().getId(),
        p.getClub().getName());
  }
}
