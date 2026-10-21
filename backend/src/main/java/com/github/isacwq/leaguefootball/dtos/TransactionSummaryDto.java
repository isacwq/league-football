package com.github.isacwq.leaguefootball.dtos;

import java.math.BigDecimal;

/**
 * DTO com o resumo consolidado do extrato financeiro do clube (RN17).
 */
public record TransactionSummaryDto(
    BigDecimal totalSpent,
    BigDecimal totalReceived,
    BigDecimal totalFees,
    BigDecimal totalPenalties,
    BigDecimal totalProfit) {}
