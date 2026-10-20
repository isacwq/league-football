package com.github.isacwq.leaguefootball.dtos;

import java.util.List;

public record PlayerListResponseDto(List<PlayerResponseDto> data, PageMetaDto meta) {}
