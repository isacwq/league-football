package com.github.isacwq.leaguefootball.dtos;

public record StandingResponseDto(
    Integer position,
    Long clubId,
    String clubName,
    String clubAcronym,
    Integer points,
    Integer matchesPlayed,
    Integer wins,
    Integer draws,
    Integer losses,
    Integer goalsFor,
    Integer goalsAgainst,
    Integer goalDifference) {}
