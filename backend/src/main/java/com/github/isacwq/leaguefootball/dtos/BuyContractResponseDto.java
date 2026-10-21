package com.github.isacwq.leaguefootball.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.isacwq.leaguefootball.enums.ContractStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO com os detalhes do contrato gerado na compra de um jogador (RN12).
 */
public record BuyContractResponseDto(
    BigDecimal purchaseValue,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX") OffsetDateTime loyaltyUntil,
    ContractStatus status) {}
