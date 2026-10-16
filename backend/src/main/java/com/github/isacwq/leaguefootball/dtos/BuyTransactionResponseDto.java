package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record BuyTransactionResponseDto(
    Long transactionId,
    Long playerId,
    Long clubId,
    BigDecimal amount,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mmXXX") OffsetDateTime loyaltyUntil,
    BigDecimal clubCashAfter) {}
