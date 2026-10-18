package com.github.isacwq.leaguefootball.controllers;

import com.github.isacwq.leaguefootball.dtos.*;
import com.github.isacwq.leaguefootball.services.PlayerService;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/players")
public class PlayerController {

  private final PlayerService playerService;

  public PlayerController(PlayerService playerService) {
    this.playerService = playerService;
  }

  // RN07: Consulta pública do catálogo de jogadores da liga com suporte a busca, filtros e
  // paginação.
  @GetMapping
  public ResponseEntity<PlayerListResponseDto> listPlayers(
      @ModelAttribute PlayerFilterParamsDto filters) {
    return ResponseEntity.ok(playerService.findAll(filters));
  }

  // RN06: Ficha individual do atleta com métricas dinâmicas de força geral e valor de mercado.
  @GetMapping("/{id}")
  public ResponseEntity<PlayerResponseDto> getPlayerById(@PathVariable Long id) {
    return ResponseEntity.ok(playerService.findById(id));
  }

  // RN01-RN06: Registro oficial de novo atleta na liga e cálculo inicial de atributos e valor base.
  @PostMapping
  public ResponseEntity<PlayerResponseDto> createPlayer(@Valid @RequestBody CreatePlayerDto dto) {
    PlayerResponseDto created = playerService.create(dto);
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.id())
            .toUri();
    return ResponseEntity.created(location).body(created); // HTTP 201 com Header Location
  }

  // RN08: Atualização de dados cadastrais respeitando as travas de posição e evolução etária.
  @PutMapping("/{id}")
  public ResponseEntity<PlayerResponseDto> updatePlayer(
      @PathVariable Long id, @Valid @RequestBody UpdatePlayerDto dto) {
    return ResponseEntity.ok(playerService.update(id, dto));
  }

  // RN08: Controle do estado médico e prontidão física do jogador para as partidas.
  @PatchMapping("/{id}/condition")
  public ResponseEntity<PlayerResponseDto> updateCondition(
      @PathVariable Long id, @Valid @RequestBody UpdateConditionDto dto) {
    return ResponseEntity.ok(playerService.updateCondition(id, dto));
  }

  // DELETE /api/v1/players/{id} - Exclusão lógica de jogador livre (RN09)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePlayer(@PathVariable Long id) {
    playerService.delete(id);
    return ResponseEntity.noContent().build(); // HTTP 204 sem corpo
  }
}
