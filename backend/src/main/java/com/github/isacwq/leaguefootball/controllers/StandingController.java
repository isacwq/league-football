package com.github.isacwq.leaguefootball.controllers;

import com.github.isacwq.leaguefootball.dtos.StandingResponseDto;
import com.github.isacwq.leaguefootball.services.StandingService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/standings")
public class StandingController {

  private final StandingService standingService;

  public StandingController(StandingService standingService) {
    this.standingService = standingService;
  }

  // RN21: Tabela de classificação geral da liga ordenada pelos critérios oficiais de desempate.
  @GetMapping
  public ResponseEntity<List<StandingResponseDto>> getStandings() {
    return ResponseEntity.ok(standingService.getStandings());
  }
}
