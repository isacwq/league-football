package com.github.isacwq.leaguefootball.controllers;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.github.isacwq.leaguefootball.dtos.StandingResponseDto;
import com.github.isacwq.leaguefootball.exceptions.GlobalExceptionHandler;
import com.github.isacwq.leaguefootball.services.StandingService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(StandingController.class)
@Import(GlobalExceptionHandler.class)
class StandingControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private StandingService standingService;

  @Test
  @DisplayName("GET /api/v1/standings - Deve retornar 200 OK com a classificação ordenada [RN21]")
  void getStandings_Returns200Ok() throws Exception {
    StandingResponseDto pos1 =
        new StandingResponseDto(1, 2L, "Delta FC", "DLT", 3, 1, 1, 0, 0, 2, 1, 1);
    StandingResponseDto pos2 =
        new StandingResponseDto(2, 1L, "Águias FC", "AGU", 0, 1, 0, 0, 1, 1, 2, -1);

    when(standingService.getStandings()).thenReturn(List.of(pos1, pos2));

    mockMvc
        .perform(get("/api/v1/standings").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].position").value(1))
        .andExpect(jsonPath("$[0].club_name").value("Delta FC"))
        .andExpect(jsonPath("$[1].position").value(2))
        .andExpect(jsonPath("$[1].club_name").value("Águias FC"));
  }
}
