package com.github.isacwq.leaguefootball.controllers;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.github.isacwq.leaguefootball.dtos.ClubSimpleResponseDto;
import com.github.isacwq.leaguefootball.dtos.CreateClubDto;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.GlobalExceptionHandler;
import com.github.isacwq.leaguefootball.services.ClubService;
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

@WebMvcTest(ClubController.class)
@Import(GlobalExceptionHandler.class)
class ClubControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private ClubService clubService;

  @Test
  @DisplayName("GET /api/v1/clubs - Deve retornar 200 OK com lista de clubes")
  void listClubs_Returns200Ok() throws Exception {
    ClubSimpleResponseDto club =
        new ClubSimpleResponseDto(
            1L,
            "Águias FC",
            "AGU",
            BigDecimal.valueOf(300.00),
            BigDecimal.ZERO,
            BigDecimal.valueOf(300.00),
            0);
    when(clubService.findAll("name")).thenReturn(List.of(club));

    mockMvc
        .perform(get("/api/v1/clubs").param("sort", "name"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].id").value(1))
        .andExpect(jsonPath("$[0].name").value("Águias FC"))
        .andExpect(jsonPath("$[0].acronym").value("AGU"))
        .andExpect(jsonPath("$[0].cash").value(300.00));
  }

  @Test
  @DisplayName("POST /api/v1/clubs - Deve criar clube com 201 Created e Header Location")
  void createClub_Returns201Created() throws Exception {
    CreateClubDto dto = new CreateClubDto("Águias FC", "AGU");
    ClubSimpleResponseDto created =
        new ClubSimpleResponseDto(
            1L,
            "Águias FC",
            "AGU",
            BigDecimal.valueOf(300.00),
            BigDecimal.ZERO,
            BigDecimal.valueOf(300.00),
            0);

    when(clubService.create(any(CreateClubDto.class))).thenReturn(created);

    mockMvc
        .perform(
            post("/api/v1/clubs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", containsString("/api/v1/clubs/1")))
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.cash").value(300.00));
  }

  @Test
  @DisplayName(
      "POST /api/v1/clubs - Deve retornar 409 Conflict quando o limite de 20 clubes é atingido"
          + " [RN10]")
  void createClub_LimitReached_Returns409() throws Exception {
    CreateClubDto dto = new CreateClubDto("Novo Clube", "NVC");
    when(clubService.create(any(CreateClubDto.class)))
        .thenThrow(new BusinessRuleException("A liga aceita no máximo 20 clubes."));

    mockMvc
        .perform(
            post("/api/v1/clubs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("A liga aceita no máximo 20 clubes."));
  }
}
