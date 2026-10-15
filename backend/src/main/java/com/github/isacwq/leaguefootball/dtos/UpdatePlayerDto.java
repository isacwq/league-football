package com.github.isacwq.leaguefootball.dtos;

import com.github.isacwq.leaguefootball.enums.Position;
import jakarta.validation.constraints.*;

public record UpdatePlayerDto(
    @NotBlank @Size(min = 3, max = 100) String name,
    @NotNull Position position,
    @NotNull @Min(1) @Max(100) Integer agility,
    @NotNull @Min(1) @Max(45) Integer age) {}
