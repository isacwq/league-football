package com.github.isacwq.leaguefootball.controllers;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.github.isacwq.leaguefootball.dtos.TransactionHistoryResponseDto;
import com.github.isacwq.leaguefootball.dtos.TransactionSummaryDto;
import com.github.isacwq.leaguefootball.exceptions.GlobalExceptionHandler;
import com.github.isacwq.leaguefootball.services.TransactionService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TransactionController.class)
@Import(GlobalExceptionHandler.class)
class TransactionControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private TransactionService transactionService;

  @Test
  @DisplayName("GET /api/v1/clubs/{id}/transactions - Deve retornar 200 OK com histórico e summary")
  void getTransactions_Returns200Ok() throws Exception {
    TransactionSummaryDto summary =
        new TransactionSummaryDto(
            BigDecimal.valueOf(38.85),
            BigDecimal.ZERO,
            BigDecimal.valueOf(1.85),
            BigDecimal.ZERO,
            BigDecimal.ZERO);
    TransactionHistoryResponseDto response = new TransactionHistoryResponseDto(summary, List.of());

    when(transactionService.findTransactions(1L, null, null)).thenReturn(response);

    mockMvc
        .perform(get("/api/v1/clubs/1/transactions"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.summary.total_spent").value(38.85));
  }

  @Test
  @DisplayName(
      "GET /api/v1/clubs/{id}/transactions/export - Deve retornar 200 OK com arquivo CSV (text/csv)"
          + " [RN18]")
  void exportTransactionsCsv_ReturnsCsvFile() throws Exception {
    String csvData = "data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n";
    when(transactionService.generateCsv(1L, null, null)).thenReturn(csvData);

    mockMvc
        .perform(get("/api/v1/clubs/1/transactions/export"))
        .andExpect(status().isOk())
        .andExpect(content().contentType("text/csv;charset=utf-8"))
        .andExpect(content().string(csvData));
  }
}
