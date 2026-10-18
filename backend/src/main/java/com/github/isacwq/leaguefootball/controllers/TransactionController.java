package com.github.isacwq.leaguefootball.controllers;

import com.github.isacwq.leaguefootball.dtos.TransactionHistoryResponseDto;
import com.github.isacwq.leaguefootball.services.TransactionService;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clubs/{id}/transactions")
public class TransactionController {

  private final TransactionService transactionService;

  public TransactionController(TransactionService transactionService) {
    this.transactionService = transactionService;
  }

  // RN17: Demonstrativo e balanço contábil do clube para prestação de contas com a liga.
  @GetMapping
  public ResponseEntity<TransactionHistoryResponseDto> getTransactions(
      @PathVariable("id") Long clubId,
      @Nullable @RequestParam(name = "type", required = false) String type,
      @Nullable @RequestParam(name = "player_id", required = false) Long playerId) {
    return ResponseEntity.ok(transactionService.findTransactions(clubId, type, playerId));
  }

  // RN18: Relatório financeiro formatado em CSV para fins de auditoria e exportação externa.
  @GetMapping("/export")
  public ResponseEntity<String> exportTransactionsCsv(
      @PathVariable("id") Long clubId,
      @Nullable @RequestParam(name = "type", required = false) String type,
      @Nullable @RequestParam(name = "player_id", required = false) Long playerId) {

    String csvContent = transactionService.generateCsv(clubId, type, playerId);

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=utf-8") // Exigência da RN18
        .body(csvContent);
  }
}
