package com.github.isacwq.leaguefootball.dtos;

import com.github.isacwq.leaguefootball.enums.Formation;
import java.util.List;
import org.jspecify.annotations.Nullable;

public record LineupResponseDto(
    Long clubId,
    @Nullable Formation formation,
    Boolean isComplete,
    List<PlayerResponseDto> players) {}
