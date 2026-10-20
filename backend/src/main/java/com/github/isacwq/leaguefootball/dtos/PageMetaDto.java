package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PageMetaDto(
    Integer page,
    Integer limit,
    @JsonProperty("total_items") Long totalItems,
    @JsonProperty("total_pages") Integer totalPages) {}
