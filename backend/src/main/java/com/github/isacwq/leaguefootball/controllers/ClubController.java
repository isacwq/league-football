package com.github.isacwq.leaguefootball.controllers;

import com.github.isacwq.leaguefootball.dtos.ClubDetailResponseDto;
import com.github.isacwq.leaguefootball.dtos.ClubSimpleResponseDto;
import com.github.isacwq.leaguefootball.dtos.CreateClubDto;
import com.github.isacwq.leaguefootball.services.ClubService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/clubs")
public class ClubController {

  private final ClubService clubService;

  public ClubController(ClubService clubService) {
    this.clubService = clubService;
  }

  // RN10: Listagem geral de clubes participantes da liga com opção de ordenação por patrimônio.
  @GetMapping
  public ResponseEntity<List<ClubSimpleResponseDto>> listClubs(
      @RequestParam(name = "sort", defaultValue = "name") String sort) {
    return ResponseEntity.ok(clubService.findAll(sort));
  }

  // RN10: Inscrição de novos clubes na liga com aporte financeiro inicial fixo de 300.00 moedas.
  @PostMapping
  public ResponseEntity<ClubSimpleResponseDto> createClub(@Valid @RequestBody CreateClubDto dto) {
    ClubSimpleResponseDto created = clubService.create(dto);
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.id())
            .toUri();
    return ResponseEntity.created(location).body(created);
  }

  // RN11: Detalhamento do clube e de seu plantel organizado por setor tático e situação contratual.
  @GetMapping("/{id}")
  public ResponseEntity<ClubDetailResponseDto> getClubById(@PathVariable Long id) {
    return ResponseEntity.ok(clubService.findDetailById(id));
  }
}
