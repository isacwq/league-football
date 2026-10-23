package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.isacwq.leaguefootball.enums.TransactionType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.jspecify.annotations.Nullable;

/**
 * DTO de resposta oficial do endpoint POST /api/v1/players/{id}/buy (RN12, RN13).
 */
public record BuyTransactionResponseDto(
    Long id,
    Long clubId,
    Long playerId,
    String playerName,
    TransactionType type,
    BigDecimal value,
    BigDecimal fee,
    BigDecimal penalty,
    @Nullable BigDecimal profit,
    BigDecimal cashChange,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX") OffsetDateTime createdAt,
    BuyContractResponseDto contract,
    BigDecimal clubCash) {}
