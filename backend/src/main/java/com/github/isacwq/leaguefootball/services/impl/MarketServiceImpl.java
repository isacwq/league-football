package com.github.isacwq.leaguefootball.services.impl;

import com.github.isacwq.leaguefootball.dtos.BuyPlayerDto;
import com.github.isacwq.leaguefootball.dtos.BuyTransactionResponseDto;
import com.github.isacwq.leaguefootball.dtos.SellTransactionResponseDto;
import com.github.isacwq.leaguefootball.entities.ClubEntity;
import com.github.isacwq.leaguefootball.entities.ContractEntity;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import com.github.isacwq.leaguefootball.entities.TransactionEntity;
import com.github.isacwq.leaguefootball.enums.ContractStatus;
import com.github.isacwq.leaguefootball.enums.TransactionType;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.ResourceNotFoundException;
import com.github.isacwq.leaguefootball.repositories.*;
import com.github.isacwq.leaguefootball.services.MarketService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementação das operações do mercado de transferências, compras, vendas e contratos.
 */
@Service
public class MarketServiceImpl implements MarketService {

  private final PlayerRepository playerRepository;
  private final ClubRepository clubRepository;
  private final TransactionRepository transactionRepository;
  private final ContractRepository contractRepository;
  private final LineupRepository lineupRepository;
  private final BusinessCalculatorService calculator;

  public MarketServiceImpl(
      PlayerRepository playerRepository,
      ClubRepository clubRepository,
      TransactionRepository transactionRepository,
      ContractRepository contractRepository,
      LineupRepository lineupRepository,
      BusinessCalculatorService calculator) {
    this.playerRepository = playerRepository;
    this.clubRepository = clubRepository;
    this.transactionRepository = transactionRepository;
    this.contractRepository = contractRepository;
    this.lineupRepository = lineupRepository;
    this.calculator = calculator;
  }

  @Override
  @Transactional // Atômico: caixa, contrato, vinculo e transação COMPRA [4, 5]
  public BuyTransactionResponseDto buyPlayer(Long playerId, BuyPlayerDto dto) {
    PlayerEntity player =
        playerRepository
            .findByIdAndDeletedAtIsNull(playerId)
            .orElseThrow(() -> new ResourceNotFoundException("Jogador não encontrado."));
    ClubEntity club =
        clubRepository
            .findById(dto.clubId())
            .orElseThrow(() -> new ResourceNotFoundException("Clube não encontrado."));

    if (player.getClub() != null) {
      throw new BusinessRuleException("O jogador já possui vínculo com outro clube."); // RN12 [29]
    }
    if (club.getPlayers().size() >= 12) {
      throw new BusinessRuleException(
          "O clube atinge o limite máximo de 12 jogadores no elenco."); // RN14 [15]
    }
    if (transactionRepository.existsByClubIdAndPlayerIdAndType(
        club.getId(), player.getId(), TransactionType.VENDA)) {
      throw new BusinessRuleException(
          "Um clube não pode recomprar um jogador que ele mesmo já vendeu."); // RN12 [14]
    }

    BigDecimal marketValue =
        calculator.calculateMarketValue(
            player.getBaseValue(), player.getCondition(), player.getAgility(), player.getAge());
    BigDecimal fee = calculator.calculatePurchaseFee(marketValue);
    BigDecimal totalCost = marketValue.add(fee);

    BigDecimal maxLimit =
        club.getCash().multiply(BigDecimal.valueOf(0.50)); // Limite de 50% do caixa [14]
    if (totalCost.compareTo(maxLimit) > 0) {
      throw new BusinessRuleException(
          String.format(
              "O custo da compra (%.2f) passa do limite de 50%% do caixa (%.2f).",
              totalCost, maxLimit)); // RN13 [14]
    }

    // Executa atualização financeira e contratual
    club.setCash(club.getCash().subtract(totalCost));
    player.setClub(club);

    ContractEntity contract =
        new ContractEntity(
            player,
            club,
            marketValue,
            dto.loyaltyUntil(),
            ContractStatus.ATIVO,
            OffsetDateTime.now());

    // Mantém a lista da entidade sincronizada na memória
    player.getContracts().add(contract);

    contractRepository.save(contract);

    TransactionEntity tx =
        new TransactionEntity(
            club,
            player,
            player.getName(),
            TransactionType.COMPRA,
            marketValue,
            fee,
            BigDecimal.ZERO,
            null,
            totalCost.negate(),
            OffsetDateTime.now());
    TransactionEntity savedTx = transactionRepository.save(tx);

    playerRepository.save(player);
    clubRepository.save(club);

    return new BuyTransactionResponseDto(
        savedTx.getId(),
        player.getId(),
        club.getId(),
        marketValue,
        dto.loyaltyUntil(),
        club.getCash());
  }

  @Override
  @Transactional // Atômico: caixa, multa, comissão, desvínculo, contrato e remoção da escalação [4,
  // 5]
  public SellTransactionResponseDto sellPlayer(Long playerId) {
    PlayerEntity player =
        playerRepository
            .findByIdAndDeletedAtIsNull(playerId)
            .orElseThrow(() -> new ResourceNotFoundException("Jogador não encontrado."));
    if (player.getClub() == null) {
      throw new BusinessRuleException("O jogador está livre e não pode ser vendido."); // RN16 [30]
    }

    ClubEntity club = player.getClub();
    ContractEntity contract =
        contractRepository
            .findByPlayerIdAndStatus(playerId, ContractStatus.ATIVO)
            .orElseThrow(
                () -> new BusinessRuleException("Contrato ativo não encontrado para o jogador."));

    OffsetDateTime now = OffsetDateTime.now();
    BigDecimal marketValue =
        calculator.calculateMarketValue(
            player.getBaseValue(), player.getCondition(), player.getAgility(), player.getAge());

    long remainingDays = calculator.calculateRemainingDays(contract.getLoyaltyUntil(), now);
    BigDecimal penalty = calculator.calculateLoyaltyPenalty(marketValue, remainingDays);

    BigDecimal purchaseValue = contract.getPurchaseValue();
    BigDecimal profit = marketValue.subtract(purchaseValue);
    BigDecimal commission = calculator.calculateSalesCommission(profit);

    BigDecimal netCredit =
        marketValue
            .subtract(penalty)
            .subtract(commission); // Crédito no caixa = Valor - Multa - Comissão [30]
    club.setCash(club.getCash().add(netCredit));

    contract.setEndAt(now);
    contract.setStatus(
        penalty.compareTo(BigDecimal.ZERO) > 0
            ? ContractStatus.RESCINDIDO
            : ContractStatus.ENCERRADO); // RN15 [16]

    // Jogador volta a ser livre e sai da escalação
    player.setClub(null);
    lineupRepository.deleteByPlayerId(player.getId());

    TransactionEntity tx =
        new TransactionEntity(
            club,
            player,
            player.getName(),
            TransactionType.VENDA,
            marketValue,
            commission,
            penalty,
            profit,
            netCredit,
            now);
    TransactionEntity savedTx = transactionRepository.save(tx);

    playerRepository.save(player);
    clubRepository.save(club);

    return new SellTransactionResponseDto(
        savedTx.getId(),
        player.getId(),
        club.getId(),
        marketValue,
        commission,
        penalty,
        profit,
        netCredit,
        club.getCash());
  }
}
