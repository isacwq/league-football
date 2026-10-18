package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.isacwq.leaguefootball.enums.MatchResult;
import java.time.OffsetDateTime;

public record MatchSimpleResponseDto(
    Long id,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX") OffsetDateTime playedAt,
    Long homeClubId,
    String homeClubName,
    Integer homeGoals,
    Long awayClubId,
    String awayClubName,
    Integer awayGoals,
    MatchResult result) {}
