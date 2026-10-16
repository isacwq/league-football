package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.isacwq.leaguefootball.enums.ContractStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ContractInfoDto(
    ContractStatus status,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mmXXX") OffsetDateTime loyaltyUntil,
    BigDecimal terminationFee) {}
