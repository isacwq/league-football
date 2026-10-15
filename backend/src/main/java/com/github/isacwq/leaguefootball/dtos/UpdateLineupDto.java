package com.github.isacwq.leaguefootball.dtos;

import com.github.isacwq.leaguefootball.enums.Formation;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateLineupDto(
    @NotNull Formation formation,
    @NotNull @Size(min = 5, max = 5) List<@NotNull @Positive Long> playerIds) {}
