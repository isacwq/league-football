package com.github.isacwq.leaguefootball.dtos;

import com.github.isacwq.leaguefootball.enums.Position;
import jakarta.validation.constraints.*;

public record CreatePlayerDto(
    @NotBlank @Size(min = 3, max = 100) String name,
    @NotNull Position position,
    @NotNull @Min(1) @Max(100) Integer agility,
    @NotNull @Min(16) @Max(45) Integer age,
    @NotNull @Min(1) @Max(99) Integer pace,
    @NotNull @Min(1) @Max(99) Integer shooting,
    @NotNull @Min(1) @Max(99) Integer passing,
    @NotNull @Min(1) @Max(99) Integer dribbling,
    @NotNull @Min(1) @Max(99) Integer defending,
    @NotNull @Min(1) @Max(99) Integer physical,
    @NotNull @Min(1) @Max(99) Integer potential) {}
