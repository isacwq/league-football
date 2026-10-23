package com.github.isacwq.leaguefootball.dtos;

import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Position;
import java.math.BigDecimal;

public record ClubPlayerItemDto(
    Long id,
    String name,
    Position position,
    Integer agility,
    Integer age,
    Condition condition,
    BigDecimal baseValue,
    BigDecimal marketValue,
    Integer pace,
    Integer shooting,
    Integer passing,
    Integer dribbling,
    Integer defending,
    Integer physical,
    Integer potential,
    Integer overall,
    Long clubId,
    ContractInfoDto contract) {}
