package com.github.isacwq.leaguefootball.controllers;

import com.github.isacwq.leaguefootball.dtos.CreateMatchDto;
import com.github.isacwq.leaguefootball.dtos.MatchDetailResponseDto;
import com.github.isacwq.leaguefootball.dtos.MatchSimpleResponseDto;
import com.github.isacwq.leaguefootball.services.MatchService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.jspecify.annotations.Nullable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/matches")
public class MatchController {

  private final MatchService matchService;

  public MatchController(MatchService matchService) {
    this.matchService = matchService;
  }

  // RN20: Execução da simulação do confronto tático entre dois clubes e registro dos 6 duelos.
  @PostMapping
  public ResponseEntity<MatchDetailResponseDto> playMatch(@Valid @RequestBody CreateMatchDto dto) {
    MatchDetailResponseDto match = matchService.playMatch(dto);
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(match.id())
            .toUri();
    return ResponseEntity.created(location).body(match); // HTTP 201 com Header Location
  }

  // RN21: Histórico oficial de partidas disputadas na temporada da liga.
  @GetMapping
  public ResponseEntity<List<MatchSimpleResponseDto>> listMatches(
      @Nullable @RequestParam(name = "club_id", required = false) Long clubId) {
    return ResponseEntity.ok(matchService.findAll(clubId));
  }

  // RN21: Súmula detalhada do confronto com resultado individual de cada duelo tático.
  @GetMapping("/{id}")
  public ResponseEntity<MatchDetailResponseDto> getMatchById(@PathVariable Long id) {
    return ResponseEntity.ok(matchService.findById(id));
  }
}
