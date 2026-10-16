package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.OffsetDateTime;
import java.util.regex.MatchResult;

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
