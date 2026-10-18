package com.github.isacwq.leaguefootball.controllers;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.github.isacwq.leaguefootball.dtos.*;
import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Position;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.GlobalExceptionHandler;
import com.github.isacwq.leaguefootball.exceptions.ResourceNotFoundException;
import com.github.isacwq.leaguefootball.services.PlayerService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

@WebMvcTest(PlayerController.class)
@Import(GlobalExceptionHandler.class)
class PlayerControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private PlayerService playerService;

  @Test
  @DisplayName("GET /api/v1/players - Deve retornar 200 OK com lista paginada")
  void listPlayers_Returns200Ok() throws Exception {
    PlayerResponseDto player = createPlayerResponse(1L, "Meia Lua", Position.MEI, Condition.APTO);
    PlayerListResponseDto response = new PlayerListResponseDto(List.of(player), 1, 10, 1L, 1);

    when(playerService.findAll(any(PlayerFilterParamsDto.class))).thenReturn(response);

    mockMvc
        .perform(
            get("/api/v1/players")
                .param("page", "1")
                .param("limit", "10")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.data[0].id").value(1))
        .andExpect(jsonPath("$.data[0].name").value("Meia Lua"))
        .andExpect(jsonPath("$.total").value(1));
  }

  @Test
  @DisplayName("GET /api/v1/players/{id} - Deve retornar 404 Not Found se jogador não existir [V8]")
  void getPlayerById_NotFound_Returns404() throws Exception {
    when(playerService.findById(999L))
        .thenThrow(new ResourceNotFoundException("Jogador não encontrado."));

    mockMvc
        .perform(get("/api/v1/players/999"))
        .andExpect(status().isNotFound())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.message").value("Jogador não encontrado."));
  }

  @Test
  @DisplayName("POST /api/v1/players - Deve cadastrar jogador com 201 Created e Header Location")
  void createPlayer_Returns201Created() throws Exception {
    CreatePlayerDto dto =
        new CreatePlayerDto("Meia Lua", Position.MEI, 85, 25, 70, 68, 82, 79, 55, 64, 86);
    PlayerResponseDto created = createPlayerResponse(2L, "Meia Lua", Position.MEI, Condition.APTO);

    when(playerService.create(any(CreatePlayerDto.class))).thenReturn(created);

    mockMvc
        .perform(
            post("/api/v1/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", containsString("/api/v1/players/2")))
        .andExpect(jsonPath("$.id").value(2))
        .andExpect(jsonPath("$.name").value("Meia Lua"));
  }

  @Test
  @DisplayName(
      "PUT /api/v1/players/{id} - Deve retornar 409 Conflict se tentar alterar posição de jogador"
          + " com clube [RN08]")
  void updatePlayer_WhenInClub_Returns409Conflict() throws Exception {
    UpdatePlayerDto dto = new UpdatePlayerDto("Meia Lua", Position.ZAG, 85, 25);

    when(playerService.update(eq(2L), any(UpdatePlayerDto.class)))
        .thenThrow(
            new BusinessRuleException(
                "Jogador pertencente a um clube não pode alterar de posição."));

    mockMvc
        .perform(
            put("/api/v1/players/2")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.message")
                .value("Jogador pertencente a um clube não pode alterar de posição."));
  }

  @Test
  @DisplayName(
      "PATCH /api/v1/players/{id}/condition - Deve retornar 409 Conflict de DOENTE para APTO"
          + " [RN08]")
  void updateCondition_InvalidTransition_Returns409Conflict() throws Exception {
    UpdateConditionDto dto = new UpdateConditionDto(Condition.APTO);

    when(playerService.updateCondition(eq(2L), any(UpdateConditionDto.class)))
        .thenThrow(
            new BusinessRuleException(
                "Jogador com condição DOENTE não pode alterar diretamente para APTO."));

    mockMvc
        .perform(
            patch("/api/v1/players/2/condition")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.message")
                .value("Jogador com condição DOENTE não pode alterar diretamente para APTO."));
  }

  @Test
  @DisplayName(
      "DELETE /api/v1/players/{id} - Deve realizar exclusão lógica com 204 No Content [RN09]")
  void deletePlayer_Returns204NoContent() throws Exception {
    doNothing().when(playerService).delete(2L);

    mockMvc
        .perform(delete("/api/v1/players/2"))
        .andExpect(status().isNoContent())
        .andExpect(content().string(""));
  }

  private PlayerResponseDto createPlayerResponse(
      Long id, String name, Position pos, Condition cond) {
    return new PlayerResponseDto(
        id,
        name,
        pos,
        85,
        25,
        70,
        68,
        82,
        79,
        55,
        64,
        86,
        75,
        BigDecimal.valueOf(40.00),
        BigDecimal.valueOf(40.00),
        cond,
        null,
        null);
  }
}
