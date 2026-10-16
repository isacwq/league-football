package com.github.isacwq.leaguefootball.dtos;

import com.github.isacwq.leaguefootball.enums.MatchAttribute;

public record MatchDuelResponseDto(
    Integer duelNumber,
    MatchAttribute attribute,
    DuelPlayerDto homePlayer,
    DuelPlayerDto awayPlayer,
    String winner) {}
