package com.github.isacwq.leaguefootball.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.github.isacwq.leaguefootball.dtos.LineupResponseDto;
import com.github.isacwq.leaguefootball.dtos.UpdateLineupDto;
import com.github.isacwq.leaguefootball.enums.Formation;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.GlobalExceptionHandler;
import com.github.isacwq.leaguefootball.services.LineupService;
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

@WebMvcTest(LineupController.class)
@Import(GlobalExceptionHandler.class)
class LineupControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private LineupService lineupService;

  @Test
  @DisplayName("PUT /api/v1/clubs/{id}/lineup - Deve salvar escalação válida com 200 OK")
  void updateLineup_Returns200Ok() throws Exception {
    UpdateLineupDto dto = new UpdateLineupDto(Formation.F_2_1_1, List.of(30L, 31L, 32L, 33L, 34L));
    LineupResponseDto response = new LineupResponseDto(1L, Formation.F_2_1_1, true, List.of());

    when(lineupService.saveLineup(eq(1L), any(UpdateLineupDto.class))).thenReturn(response);

    mockMvc
        .perform(
            put("/api/v1/clubs/1/lineup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.formation").value("2-1-1"))
        .andExpect(jsonPath("$.is_complete").value(true));
  }

  @Test
  @DisplayName(
      "PUT /api/v1/clubs/{id}/lineup - Deve retornar 409 Conflict se escalado jogador DOENTE"
          + " [RN19]")
  void updateLineup_WithSickPlayer_Returns409() throws Exception {
    UpdateLineupDto dto = new UpdateLineupDto(Formation.F_2_1_1, List.of(30L, 31L, 32L, 33L, 34L));
    when(lineupService.saveLineup(eq(1L), any(UpdateLineupDto.class)))
        .thenThrow(new BusinessRuleException("Jogador com condição DOENTE não pode ser escalado."));

    mockMvc
        .perform(
            put("/api/v1/clubs/1/lineup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.message").value("Jogador com condição DOENTE não pode ser escalado."));
  }
}
