package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.github.isacwq.leaguefootball.enums.TransactionType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.jspecify.annotations.Nullable;

/**
 * DTO de representação de um item individual do histórico de transações (RN17).
 */
public record TransactionItemDto(
    Long id,
    Long clubId,
    Long playerId,
    String playerName,
    TransactionType type,
    BigDecimal value,
    BigDecimal fee,
    BigDecimal penalty,
    @Nullable @JsonInclude(JsonInclude.Include.ALWAYS) BigDecimal profit,
    BigDecimal cashChange,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX") OffsetDateTime createdAt) {}
