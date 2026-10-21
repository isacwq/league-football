package com.github.isacwq.leaguefootball.services.impl;

import com.github.isacwq.leaguefootball.dtos.*;
import com.github.isacwq.leaguefootball.entities.ClubEntity;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.ResourceNotFoundException;
import com.github.isacwq.leaguefootball.repositories.ClubRepository;
import com.github.isacwq.leaguefootball.services.ClubService;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementação das regras de negócio e operações de gestão de clubes.
 */
@Service
public class ClubServiceImpl implements ClubService {

  private final ClubRepository clubRepository;
  private final BusinessCalculatorService calculator;

  public ClubServiceImpl(ClubRepository clubRepository, BusinessCalculatorService calculator) {
    this.clubRepository = clubRepository;
    this.calculator = calculator;
  }

  @Override
  @Transactional(readOnly = true)
  public List<ClubSimpleResponseDto> findAll(String sort) {
    List<ClubEntity> clubs = clubRepository.findAll();

    return clubs.stream()
        .map(this::mapToSimpleDto)
        .sorted(
            (c1, c2) -> {
              if ("net_worth_desc".equals(sort)) return c2.netWorth().compareTo(c1.netWorth());
              if ("net_worth_asc".equals(sort)) return c1.netWorth().compareTo(c2.netWorth());
              return c1.name().compareToIgnoreCase(c2.name());
            })
        .toList();
  }

  @Override
  @Transactional
  public ClubSimpleResponseDto create(CreateClubDto dto) {
    if (clubRepository.count() >= 20) {
      throw new BusinessRuleException(
          "A liga aceita no máximo 20 clubes."); // RN10: Teto de 20 clubes na liga
    }
    if (clubRepository.existsByNameIgnoreCase(dto.name())) {
      throw new BusinessRuleException("Já existe um clube cadastrado com este nome.");
    }
    if (clubRepository.existsByAcronymIgnoreCase(dto.acronym())) {
      throw new BusinessRuleException(
          "Já existe um clube cadastrado com esta sigla."); // RN10: Teto de 20 clubes na liga
    }

    ClubEntity club = new ClubEntity();
    club.setName(dto.name().trim());
    club.setAcronym(dto.acronym().toUpperCase());
    club.setCash(BigDecimal.valueOf(300.00)); // RN10: Aporte financeiro inicial fixo

    return mapToSimpleDto(clubRepository.save(club));
  }

  @Override
  @Transactional(readOnly = true)
  public ClubDetailResponseDto findDetailById(Long id) {
    ClubEntity club =
        clubRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Clube não encontrado."));

    // RN11: Elenco ordenado por setor tático (GOL, ZAG, LAT, MEI, ATA), nome e ID para a súmula.
    var squadItems =
        club.getPlayers().stream()
            .filter(p -> p.getDeletedAt() == null)
            .map(this::mapToSquadItemDto)
            .sorted(
                Comparator.comparing((ClubPlayerItemDto p) -> p.position().ordinal())
                    .thenComparing(ClubPlayerItemDto::name)
                    .thenComparing(ClubPlayerItemDto::id))
            .toList();

    BigDecimal squadValue =
        squadItems.stream()
            .map(ClubPlayerItemDto::marketValue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal netWorth = club.getCash().add(squadValue);

    return new ClubDetailResponseDto(
        club.getId(),
        club.getName(),
        club.getAcronym(),
        club.getCash(),
        squadValue,
        netWorth,
        squadItems);
  }

  private ClubSimpleResponseDto mapToSimpleDto(ClubEntity c) {
    BigDecimal squadValue =
        c.getPlayers().stream()
            .filter(p -> p.getDeletedAt() == null)
            .map(
                p ->
                    calculator.calculateMarketValue(
                        p.getBaseValue(), p.getCondition(), p.getAgility(), p.getAge()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal netWorth = c.getCash().add(squadValue);
    return new ClubSimpleResponseDto(
        c.getId(),
        c.getName(),
        c.getAcronym(),
        c.getCash(),
        squadValue,
        netWorth,
        c.getPlayers().size());
  }

  private ClubPlayerItemDto mapToSquadItemDto(PlayerEntity p) {
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

    var contract = p.getActiveContract();

    ContractInfoDto contractDto = null;
    if (contract != null) {
      long remainingDays =
          calculator.calculateRemainingDays(
              contract.getLoyaltyUntil(), java.time.OffsetDateTime.now());
      int penaltyRate = calculator.calculateLoyaltyPenaltyRate(remainingDays);
      contractDto =
          new ContractInfoDto(
              contract.getPurchaseValue(), contract.getLoyaltyUntil(), remainingDays, penaltyRate);
    }

    return new ClubPlayerItemDto(
        p.getId(),
        p.getName(),
        p.getPosition(),
        p.getAgility(),
        p.getAge(),
        p.getCondition(),
        p.getBaseValue(),
        marketValue,
        p.getPace(),
        p.getShooting(),
        p.getPassing(),
        p.getDribbling(),
        p.getDefending(),
        p.getPhysical(),
        p.getPotential(),
        overall,
        p.getClub() != null ? p.getClub().getId() : null,
        contractDto);
  }
}
