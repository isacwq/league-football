package com.github.isacwq.leaguefootball.dtos;

import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Position;
import java.math.BigDecimal;

public record ClubPlayerItemDto(
    Long id,
    String name,
    Position position,
    Integer overall,
    BigDecimal marketValue,
    Condition condition,
    ContractInfoDto contract) {}
