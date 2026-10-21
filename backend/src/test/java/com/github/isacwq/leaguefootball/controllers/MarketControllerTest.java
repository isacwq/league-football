package com.github.isacwq.leaguefootball.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.github.isacwq.leaguefootball.dtos.BuyContractResponseDto;
import com.github.isacwq.leaguefootball.dtos.BuyPlayerDto;
import com.github.isacwq.leaguefootball.dtos.BuyTransactionResponseDto;
import com.github.isacwq.leaguefootball.enums.ContractStatus;
import com.github.isacwq.leaguefootball.enums.TransactionType;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.GlobalExceptionHandler;
import com.github.isacwq.leaguefootball.services.MarketService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

@WebMvcTest(MarketController.class)
@Import(GlobalExceptionHandler.class)
class MarketControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private MarketService marketService;

  @Test
  @DisplayName("POST /api/v1/players/{id}/buy - Deve comprar jogador livre com 200 OK")
  void buyPlayer_Returns200Ok() throws Exception {
    OffsetDateTime loyaltyUntil = OffsetDateTime.parse("2027-03-02T10:15:00-03:00");
    OffsetDateTime createdAt = OffsetDateTime.parse("2026-11-02T10:15:00-03:00");
    BuyPlayerDto dto = new BuyPlayerDto(1L, loyaltyUntil);

    BuyContractResponseDto contractDto =
        new BuyContractResponseDto(BigDecimal.valueOf(37.00), loyaltyUntil, ContractStatus.ATIVO);

    BuyTransactionResponseDto response =
        new BuyTransactionResponseDto(
            10L,
            1L,
            2L,
            "Meia Lua",
            TransactionType.COMPRA,
            BigDecimal.valueOf(37.00),
            BigDecimal.valueOf(1.85),
            BigDecimal.valueOf(0.00),
            null, // profit é nulo em compras
            BigDecimal.valueOf(-38.85),
            createdAt,
            contractDto,
            BigDecimal.valueOf(261.15));

    when(marketService.buyPlayer(eq(2L), any(BuyPlayerDto.class))).thenReturn(response);

    mockMvc
        .perform(
            post("/api/v1/players/2/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(10))
        .andExpect(jsonPath("$.club_id").value(1))
        .andExpect(jsonPath("$.player_id").value(2))
        .andExpect(jsonPath("$.player_name").value("Meia Lua"))
        .andExpect(jsonPath("$.type").value("COMPRA"))
        .andExpect(jsonPath("$.value").value(37.00))
        .andExpect(jsonPath("$.fee").value(1.85))
        .andExpect(jsonPath("$.penalty").value(0.00))
        .andExpect(jsonPath("$.profit").value(org.hamcrest.Matchers.nullValue()))
        .andExpect(jsonPath("$.cash_change").value(-38.85))
        .andExpect(jsonPath("$.contract.purchase_value").value(37.00))
        .andExpect(jsonPath("$.contract.status").value("ATIVO"))
        .andExpect(jsonPath("$.club_cash").value(261.15));
  }

  @Test
  @DisplayName(
      "POST /api/v1/players/{id}/buy - Deve retornar 409 Conflict se custo exceder 50% do caixa"
          + " [RN13]")
  void buyPlayer_ExceedsCashLimit_Returns409() throws Exception {
    BuyPlayerDto dto = new BuyPlayerDto(1L, OffsetDateTime.now().plusDays(30));
    when(marketService.buyPlayer(eq(2L), any(BuyPlayerDto.class)))
        .thenThrow(new BusinessRuleException("O custo da compra passa do limite de 50% do caixa."));

    mockMvc
        .perform(
            post("/api/v1/players/2/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.message").value("O custo da compra passa do limite de 50% do caixa."));
  }
}
