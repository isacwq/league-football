package com.github.isacwq.leaguefootball.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateMatchDto(
    @NotNull @Positive Long homeClubId, @NotNull @Positive Long awayClubId) {}
