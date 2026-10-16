package com.github.isacwq.leaguefootball.dtos;

import java.math.BigDecimal;

public record SellTransactionResponseDto(
    Long transactionId,
    Long playerId,
    Long clubId,
    BigDecimal saleValue,
    BigDecimal commissionAmount,
    BigDecimal loyaltyFine,
    BigDecimal profit,
    BigDecimal cashVariation,
    BigDecimal clubCashAfter) {}
