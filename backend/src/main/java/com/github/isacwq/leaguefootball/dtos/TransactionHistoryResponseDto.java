package com.github.isacwq.leaguefootball.dtos;

import java.util.List;

public record TransactionHistoryResponseDto(
    TransactionSummaryDto summary, List<TransactionItemDto> transactions) {}
