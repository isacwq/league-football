package com.github.isacwq.leaguefootball.controllers;

import com.github.isacwq.leaguefootball.dtos.LineupResponseDto;
import com.github.isacwq.leaguefootball.dtos.UpdateLineupDto;
import com.github.isacwq.leaguefootball.services.LineupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clubs/{id}/lineup")
public class LineupController {

  private final LineupService lineupService;

  public LineupController(LineupService lineupService) {
    this.lineupService = lineupService;
  }

  // RN19: Registro da formação tática e dos 5 titulares (1 GOL + 4 de linha) para as partidas.
  @PutMapping
  public ResponseEntity<LineupResponseDto> updateLineup(
      @PathVariable("id") Long clubId, @Valid @RequestBody UpdateLineupDto dto) {
    return ResponseEntity.ok(lineupService.saveLineup(clubId, dto));
  }

  // RN19: Validação do estado de prontidão e completude da escalação titular do clube.
  @GetMapping
  public ResponseEntity<LineupResponseDto> getLineup(@PathVariable("id") Long clubId) {
    return ResponseEntity.ok(lineupService.findByClubId(clubId));
  }
}
