package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ContractInfoDto(
    BigDecimal purchaseValue,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX") OffsetDateTime loyaltyUntil,
    Long remainingDays,
    Integer penaltyRate) {}
