package com.github.isacwq.leaguefootball.dtos;

import java.math.BigDecimal;

public record ClubSimpleResponseDto(
    Long id,
    String name,
    String acronym,
    BigDecimal cash,
    BigDecimal squadValue,
    BigDecimal netWorth,
    Integer playerCount) {}
