package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.isacwq.leaguefootball.enums.MatchResult;
import java.time.OffsetDateTime;
import java.util.List;
import org.jspecify.annotations.Nullable;

public record MatchDetailResponseDto(
    Long id,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX") OffsetDateTime playedAt,
    MatchClubSummaryDto homeClub,
    MatchClubSummaryDto awayClub,
    @Nullable Long winnerClubId,
    MatchResult result,
    List<MatchDuelResponseDto> duels) {}
