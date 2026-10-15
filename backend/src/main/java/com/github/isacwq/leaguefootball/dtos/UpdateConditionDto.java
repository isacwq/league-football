package com.github.isacwq.leaguefootball.dtos;

import com.github.isacwq.leaguefootball.enums.Condition;
import jakarta.validation.constraints.NotNull;

public record UpdateConditionDto(@NotNull Condition condition) {}
