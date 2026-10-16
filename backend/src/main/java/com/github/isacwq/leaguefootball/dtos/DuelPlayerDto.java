package com.github.isacwq.leaguefootball.dtos;

import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Position;

public record DuelPlayerDto(
    Long id, String name, Position position, Integer attributeValue, Condition condition) {}
