package com.github.isacwq.leaguefootball.dtos;

import java.math.BigDecimal;

public record TransactionSummaryDto(
    BigDecimal totalBuys,
    BigDecimal totalSells,
    BigDecimal totalCommissions,
    BigDecimal totalFines,
    BigDecimal netProfit) {}
