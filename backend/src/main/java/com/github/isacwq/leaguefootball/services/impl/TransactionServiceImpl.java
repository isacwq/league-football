package com.github.isacwq.leaguefootball.services.impl;

import com.github.isacwq.leaguefootball.dtos.TransactionHistoryResponseDto;
import com.github.isacwq.leaguefootball.dtos.TransactionItemDto;
import com.github.isacwq.leaguefootball.dtos.TransactionSummaryDto;
import com.github.isacwq.leaguefootball.entities.TransactionEntity;
import com.github.isacwq.leaguefootball.enums.TransactionType;
import com.github.isacwq.leaguefootball.exceptions.InvalidParameterException;
import com.github.isacwq.leaguefootball.exceptions.ResourceNotFoundException;
import com.github.isacwq.leaguefootball.repositories.ClubRepository;
import com.github.isacwq.leaguefootball.repositories.TransactionRepository;
import com.github.isacwq.leaguefootball.services.TransactionService;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementação do extrato de transações financeiras e exportação do relatório em formato CSV.
 */
@Service
public class TransactionServiceImpl implements TransactionService {

  private static final Locale PT_BR = new Locale("pt", "BR");

  private final TransactionRepository transactionRepository;
  private final ClubRepository clubRepository;

  public TransactionServiceImpl(
      TransactionRepository transactionRepository, ClubRepository clubRepository) {
    this.transactionRepository = transactionRepository;
    this.clubRepository = clubRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public TransactionHistoryResponseDto findTransactions(
      Long clubId, @Nullable String type, @Nullable Long playerId) {
    if (!clubRepository.existsById(clubId)) {
      throw new ResourceNotFoundException("Clube não encontrado.");
    }

    List<TransactionType> types = parseTypes(type);
    List<TransactionEntity> list = transactionRepository.findFiltered(clubId, types, playerId);
    var items = list.stream().map(this::mapToItemDto).toList();

    // RN17: Consolidação do balanço financeiro e volume de transações do clube.
    BigDecimal totalSpent =
        list.stream()
            .filter(t -> t.getType() == TransactionType.COMPRA)
            .map(t -> t.getValue().add(t.getFee()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal totalReceived =
        list.stream()
            .filter(t -> t.getType() == TransactionType.VENDA)
            .map(TransactionEntity::getCashChange)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal totalFees =
        list.stream().map(TransactionEntity::getFee).reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal totalPenalties =
        list.stream().map(TransactionEntity::getPenalty).reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal totalProfit =
        list.stream()
            .filter(t -> t.getProfit() != null)
            .map(TransactionEntity::getProfit)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    TransactionSummaryDto summary =
        new TransactionSummaryDto(
            totalSpent, totalReceived, totalFees, totalPenalties, totalProfit);
    return new TransactionHistoryResponseDto(summary, items);
  }

  @Override
  @Transactional(readOnly = true)
  public String generateCsv(Long clubId, @Nullable String type, @Nullable Long playerId) {
    if (!clubRepository.existsById(clubId)) {
      throw new ResourceNotFoundException("Clube não encontrado.");
    }

    List<TransactionType> types = parseTypes(type);
    List<TransactionEntity> list = transactionRepository.findFiltered(clubId, types, playerId);
    StringBuilder sb = new StringBuilder();

    // RN18: Estruturação do relatório no formato CSV oficial para auditoria da liga.
    sb.append("data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n");

    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");

    for (TransactionEntity t : list) {
      String name =
          t.getPlayerName().contains(";") || t.getPlayerName().contains("\"")
              ? "\"" + t.getPlayerName().replace("\"", "\"\"") + "\""
              : t.getPlayerName();

      sb.append(t.getCreatedAt().format(dtf))
          .append(";")
          .append(t.getType().name())
          .append(";")
          .append(name)
          .append(";")
          .append(formatMoney(t.getValue()))
          .append(";")
          .append(formatMoney(t.getFee()))
          .append(";")
          .append(formatMoney(t.getPenalty()))
          .append(";")
          .append(formatMoney(t.getProfit()))
          .append(";")
          .append(formatMoney(t.getCashChange()))
          .append("\n");
    }

    return sb.toString();
  }

  /**
   * Formata valores decimais no padrão brasileiro (2 casas e vírgula decimal)
   * sem alterar caracteres de texto dos demais campos.
   */
  private String formatMoney(@Nullable BigDecimal value) {
    if (value == null) {
      return "";
    }
    return String.format(PT_BR, "%.2f", value);
  }

  private List<TransactionType> parseTypes(@Nullable String typeParam) {
    if (typeParam == null || typeParam.isBlank()) {
      return Arrays.asList(TransactionType.values());
    }
    String[] parts = typeParam.split(",");
    List<TransactionType> types = new ArrayList<>();
    for (String part : parts) {
      String trimmed = part.trim();
      if (!trimmed.isEmpty()) {
        try {
          types.add(TransactionType.valueOf(trimmed.toUpperCase()));
        } catch (IllegalArgumentException e) {
          throw new InvalidParameterException("Tipo de transação inválido: " + trimmed);
        }
      }
    }
    return types.isEmpty() ? Arrays.asList(TransactionType.values()) : types;
  }

  private TransactionItemDto mapToItemDto(TransactionEntity t) {
    return new TransactionItemDto(
        t.getId(),
        t.getClub().getId(),
        t.getPlayer().getId(),
        t.getPlayerName(),
        t.getType(),
        t.getValue(),
        t.getFee(),
        t.getPenalty(),
        t.getProfit(),
        t.getCashChange(),
        t.getCreatedAt());
  }
}
