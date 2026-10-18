package com.github.isacwq.leaguefootball.controllers;

import com.github.isacwq.leaguefootball.dtos.BuyPlayerDto;
import com.github.isacwq.leaguefootball.dtos.BuyTransactionResponseDto;
import com.github.isacwq.leaguefootball.dtos.SellTransactionResponseDto;
import com.github.isacwq.leaguefootball.services.MarketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/players")
public class MarketController {

  private final MarketService marketService;

  public MarketController(MarketService marketService) {
    this.marketService = marketService;
  }

  // RN12-RN14: Contratação de atletas sem vínculo com vinculação de prazo de fidelidade e limite
  // orçamentário.
  @PostMapping("/{id}/buy")
  public ResponseEntity<BuyTransactionResponseDto> buyPlayer(
      @PathVariable Long id, @Valid @RequestBody BuyPlayerDto dto) {
    return ResponseEntity.ok(marketService.buyPlayer(id, dto));
  }

  // RN15-RN16: Negociação e venda de atletas do clube com aplicação de comissão da liga e multa por
  // rescisão antecipada.
  @PostMapping("/{id}/sell")
  public ResponseEntity<SellTransactionResponseDto> sellPlayer(@PathVariable Long id) {
    return ResponseEntity.ok(marketService.sellPlayer(id));
  }
}
