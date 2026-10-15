package com.github.isacwq.leaguefootball.dtos;

import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Position;
import java.math.BigDecimal;

public record PlayerFilterParamsDto(
    String search,
    Position position,
    Condition condition,
    Boolean free,
    Long clubId,
    Integer minAge,
    Integer maxAge,
    BigDecimal minValue,
    BigDecimal maxValue,
    String sort,
    Integer page,
    Integer limit) {}
