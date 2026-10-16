package com.github.isacwq.leaguefootball.dtos;

import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Position;
import java.math.BigDecimal;
import org.jspecify.annotations.Nullable;
import org.springframework.web.bind.annotation.BindParam;

public record PlayerFilterParamsDto(
    @Nullable String search,
    @Nullable Position position,
    @Nullable Condition condition,
    @Nullable Boolean free,
    @Nullable @BindParam("club_id") Long clubId,
    @Nullable @BindParam("min_age") Integer minAge,
    @Nullable @BindParam("max_age") Integer maxAge,
    @Nullable @BindParam("min_value") BigDecimal minValue,
    @Nullable @BindParam("max_value") BigDecimal maxValue,
    @Nullable String sort,
    @Nullable Integer page,
    @Nullable Integer limit) {}
