package com.github.isacwq.leaguefootball.controllers;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.github.isacwq.leaguefootball.dtos.CreateMatchDto;
import com.github.isacwq.leaguefootball.dtos.MatchClubSummaryDto;
import com.github.isacwq.leaguefootball.dtos.MatchDetailResponseDto;
import com.github.isacwq.leaguefootball.enums.MatchResult;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.GlobalExceptionHandler;
import com.github.isacwq.leaguefootball.services.MatchService;
import java.time.OffsetDateTime;
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

@WebMvcTest(MatchController.class)
@Import(GlobalExceptionHandler.class)
class MatchControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private MatchService matchService;

  @Test
  @DisplayName(
      "POST /api/v1/matches - Deve simular partida com 201 Created e Header Location [RN20]")
  void playMatch_Returns201Created() throws Exception {
    CreateMatchDto dto = new CreateMatchDto(1L, 2L);
    MatchClubSummaryDto home = new MatchClubSummaryDto(1L, "Águias FC", "AGU", 1);
    MatchClubSummaryDto away = new MatchClubSummaryDto(2L, "Delta FC", "DLT", 2);
    MatchDetailResponseDto match =
        new MatchDetailResponseDto(
            1L, OffsetDateTime.now(), home, away, 2L, MatchResult.VISITANTE, List.of());

    when(matchService.playMatch(any(CreateMatchDto.class))).thenReturn(match);

    mockMvc
        .perform(
            post("/api/v1/matches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", containsString("/api/v1/matches/1")))
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.result").value("VISITANTE"));
  }

  @Test
  @DisplayName(
      "POST /api/v1/matches - Deve retornar 409 Conflict se um clube não tiver escalação completa")
  void playMatch_IncompleteLineup_Returns409() throws Exception {
    CreateMatchDto dto = new CreateMatchDto(1L, 2L);
    when(matchService.playMatch(any(CreateMatchDto.class)))
        .thenThrow(
            new BusinessRuleException(
                "Um dos clubes não possui escalação completa com 5 titulares."));

    mockMvc
        .perform(
            post("/api/v1/matches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.message")
                .value("Um dos clubes não possui escalação completa com 5 titulares."));
  }
}
