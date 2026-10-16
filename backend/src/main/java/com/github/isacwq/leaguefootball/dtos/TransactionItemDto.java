package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.github.isacwq.leaguefootball.enums.TransactionType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.jspecify.annotations.Nullable;

public record TransactionItemDto(
    Long id,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX") OffsetDateTime createdAt,
    TransactionType type,
    Long playerId,
    String playerName,
    BigDecimal amount,
    BigDecimal commission,
    BigDecimal fine,
    @Nullable @JsonInclude(JsonInclude.Include.ALWAYS) BigDecimal profit,
    BigDecimal cashVariation) {}
