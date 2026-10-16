package com.github.isacwq.leaguefootball.dtos;

import java.math.BigDecimal;
import java.util.List;

public record ClubDetailResponseDto(
    Long id,
    String name,
    String acronym,
    BigDecimal cash,
    BigDecimal squadValue,
    BigDecimal netWorth,
    List<ClubPlayerItemDto> players) {}
