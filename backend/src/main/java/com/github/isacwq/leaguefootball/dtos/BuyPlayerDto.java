package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.OffsetDateTime;

public record BuyPlayerDto(
    @NotNull @Positive Long clubId,
    @NotNull @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mmXXX") OffsetDateTime loyaltyUntil) {}
