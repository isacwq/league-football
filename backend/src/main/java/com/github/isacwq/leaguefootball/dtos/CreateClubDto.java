package com.github.isacwq.leaguefootball.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateClubDto(
    @NotBlank @Size(min = 3, max = 60) String name,
    @NotBlank @Size(min = 3, max = 3) @Pattern(regexp = "^[A-Z]{3}$") String acronym) {}
