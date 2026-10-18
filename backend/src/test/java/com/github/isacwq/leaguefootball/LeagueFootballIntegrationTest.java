package com.github.isacwq.leaguefootball;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class LeagueFootballIntegrationTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  // --- MÓDULO 1: JOGADORES ---

  @Test
  @DisplayName("1.1 Deve cadastrar jogador válido com sucesso (201 Created + Header Location)")
  void shouldCreatePlayerSuccessfully() throws Exception {
    String jsonPayload =
        """
        {
            "name": "Jogador Teste",
            "position": "GOL",
            "agility": 80,
            "age": 22,
            "pace": 85,
            "shooting": 50,
            "passing": 75,
            "dribbling": 60,
            "defending": 85,
            "physical": 80,
            "potential": 90
        }
        """;

    mockMvc
        .perform(
            post("/api/v1/players").contentType(MediaType.APPLICATION_JSON).content(jsonPayload))
        .andExpect(status().isCreated())
        .andExpect(header().exists("Location"))
        .andExpect(jsonPath("$.id").exists())
        .andExpect(jsonPath("$.name").value("Jogador Teste"))
        .andExpect(jsonPath("$.condition").value("APTO"));
  }

  @Test
  @DisplayName("1.2a Deve retornar 400 Bad Request ao tentar cadastrar jogador com atributos > 480")
  void shouldReturn400WhenPlayerAttributesExceed480() throws Exception {
    String jsonPayload =
        """
        {
            "name": "Jogador Invalido",
            "position": "ATA",
            "agility": 90,
            "age": 20,
            "pace": 90, "shooting": 90, "passing": 90,
            "dribbling": 90, "defending": 90, "physical": 90,
            "potential": 95
        }
        """;

    mockMvc
        .perform(
            post("/api/v1/players").contentType(MediaType.APPLICATION_JSON).content(jsonPayload))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.message")
                .value("A soma dos seis atributos táticos não pode ultrapassar 480 pontos."));
  }

  @Test
  @DisplayName("1.2b Deve retornar 400 Bad Request ao enviar enum em caixa baixa (position='ata')")
  void shouldReturn400WhenEnumInLowercase() throws Exception {
    String jsonPayload =
        """
        {
            "name": "Jogador Minusculo",
            "position": "ata",
            "agility": 80, "age": 20,
            "pace": 80, "shooting": 80, "passing": 80,
            "dribbling": 80, "defending": 40, "physical": 70,
            "potential": 85
        }
        """;

    mockMvc
        .perform(
            post("/api/v1/players").contentType(MediaType.APPLICATION_JSON).content(jsonPayload))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.message")
                .value("Corpo da requisição inválido ou valor de enum incorreto."));
  }

  @Test
  @DisplayName("1.3 Deve consultar detalhes de jogador existente e retornar 404 para inexistente")
  void shouldGetPlayerDetailsAndReturn404ForNonExistent() throws Exception {
    MvcResult result =
        mockMvc
            .perform(
                post("/api/v1/players")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                            "name": "Meia Lua", "position": "MEI", "agility": 85, "age": 25,
                            "pace": 70, "shooting": 68, "passing": 82, "dribbling": 79, "defending": 55, "physical": 64, "potential": 86
                        }
                        """))
            .andExpect(status().isCreated())
            .andReturn();
    Long id = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();

    mockMvc
        .perform(get("/api/v1/players/" + id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Meia Lua"));

    mockMvc
        .perform(get("/api/v1/players/9999"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Jogador não encontrado."));
  }

  @Test
  @DisplayName("1.4 Deve listar jogadores com paginação, filtros e ordenação por valor descendente")
  void shouldListPlayersWithPaginationAndSorting() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/players")
                .param("page", "1")
                .param("limit", "10")
                .param("sort", "value_desc"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data").isArray())
        .andExpect(jsonPath("$.page").value(1));
  }

  @Test
  @DisplayName("1.5 Deve retornar 400 Bad Request para filtros de paginação inválidos")
  void shouldReturn400ForInvalidFilters() throws Exception {
    // Combinação contraditória free=true com club_id
    mockMvc
        .perform(get("/api/v1/players").param("free", "true").param("club_id", "1"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Não é permitido combinar free=true com club_id."));

    // Limites inválidos (page=-1, limit=0)
    mockMvc
        .perform(get("/api/v1/players").param("page", "-1").param("limit", "0"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Parâmetros de paginação inválidos."));
  }

  @Test
  @DisplayName("1.6 Deve editar jogador, bloquear redução de idade e alterar condição")
  void shouldUpdatePlayerAndValidateAgeReduction() throws Exception {
    MvcResult result =
        mockMvc
            .perform(
                post("/api/v1/players")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                            "name": "Meia Lua", "position": "MEI", "agility": 85, "age": 25,
                            "pace": 70, "shooting": 68, "passing": 82, "dribbling": 79, "defending": 55, "physical": 64, "potential": 86
                        }
                        """))
            .andExpect(status().isCreated())
            .andReturn();
    Long id = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();

    // Edição válida (200 OK)
    mockMvc
        .perform(
            put("/api/v1/players/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    { "name": "Meia Lua Editado", "position": "MEI", "agility": 85, "age": 25 }
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Meia Lua Editado"));

    // Tentar diminuir idade (409 Conflict)
    mockMvc
        .perform(
            put("/api/v1/players/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    { "name": "Meia Lua Editado", "position": "MEI", "agility": 85, "age": 20 }
                    """))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("A idade do jogador não pode ser reduzida."));

    // Alterar condição para MAL_CONDICIONADO (200 OK)
    mockMvc
        .perform(
            patch("/api/v1/players/" + id + "/condition")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"condition\": \"MAL_CONDICIONADO\" }"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.condition").value("MAL_CONDICIONADO"));
  }

  @Test
  @DisplayName(
      "1.7 Deve realizar exclusão lógica de jogador livre (204 No Content e 404 Posterior)")
  void shouldSoftDeleteFreePlayer() throws Exception {
    MvcResult result =
        mockMvc
            .perform(
                post("/api/v1/players")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                            "name": "Jogador Um", "position": "GOL", "agility": 80, "age": 22,
                            "pace": 85, "shooting": 50, "passing": 75, "dribbling": 60, "defending": 85, "physical": 80, "potential": 90
                        }
                        """))
            .andExpect(status().isCreated())
            .andReturn();
    Long id = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();

    mockMvc.perform(delete("/api/v1/players/" + id)).andExpect(status().isNoContent());

    mockMvc.perform(get("/api/v1/players/" + id)).andExpect(status().isNotFound());
  }

  // --- MÓDULO 2: CLUBES ---

  @Test
  @DisplayName("2.1 Criar clube com caixa inicial e validar unicidade de nome/sigla")
  void shouldCreateClubAndValidateUniqueness() throws Exception {
    String jsonPayload =
        """
        { "name": "Águias FC", "acronym": "AGU" }
        """;

    mockMvc
        .perform(post("/api/v1/clubs").contentType(MediaType.APPLICATION_JSON).content(jsonPayload))
        .andExpect(status().isCreated())
        .andExpect(header().exists("Location"))
        .andExpect(jsonPath("$.cash").value(300.0))
        .andExpect(jsonPath("$.net_worth").value(300.0));

    // Tentar cadastrar com o mesmo nome (409 Conflict)
    mockMvc
        .perform(post("/api/v1/clubs").contentType(MediaType.APPLICATION_JSON).content(jsonPayload))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("Já existe um clube cadastrado com este nome."));
  }

  // --- MÓDULO 3: MERCADO DE TRANSFERÊNCIAS ---

  @Test
  @DisplayName("3.1 Compra, 3.2 Conflito, 3.3 Venda, 3.4 Recompra e 3.5 Histórico de Transações")
  void shouldExecuteFullTransferMarketFlow() throws Exception {
    // Step A: Cadastrar Clube 1
    MvcResult clubResult =
        mockMvc
            .perform(
                post("/api/v1/clubs")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{ \"name\": \"Águias FC\", \"acronym\": \"AGU\" }"))
            .andExpect(status().isCreated())
            .andReturn();
    Long club1Id =
        objectMapper.readTree(clubResult.getResponse().getContentAsString()).get("id").asLong();

    // Step B: Cadastrar Clube 2
    MvcResult club2Result =
        mockMvc
            .perform(
                post("/api/v1/clubs")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{ \"name\": \"Delta FC\", \"acronym\": \"DLT\" }"))
            .andExpect(status().isCreated())
            .andReturn();
    Long club2Id =
        objectMapper.readTree(club2Result.getResponse().getContentAsString()).get("id").asLong();

    // Step C: Cadastrar Jogador Livre
    MvcResult playerResult =
        mockMvc
            .perform(
                post("/api/v1/players")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                            "name": "Meia Lua", "position": "MEI", "agility": 85, "age": 25,
                            "pace": 70, "shooting": 68, "passing": 82, "dribbling": 79, "defending": 55, "physical": 64, "potential": 86
                        }
                        """))
            .andExpect(status().isCreated())
            .andReturn();
    Long playerId =
        objectMapper.readTree(playerResult.getResponse().getContentAsString()).get("id").asLong();

    // Step 1: Clube 1 compra Jogador Livre (200 OK)
    String buyPayload =
        String.format(
            """
            {
                "club_id": %d,
                "loyalty_until": "2027-03-02T10:15-03:00"
            }
            """,
            club1Id);

    mockMvc
        .perform(
            post("/api/v1/players/" + playerId + "/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(buyPayload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.player_id").value(playerId))
        .andExpect(jsonPath("$.club_id").value(club1Id))
        .andExpect(jsonPath("$.club_cash_after").exists());

    // Step 2: Clube 2 tenta comprar jogador que já possui vínculo (409 Conflict)
    String buyPayloadClub2 =
        String.format(
            """
            {
                "club_id": %d,
                "loyalty_until": "2027-03-02T10:15-03:00"
            }
            """,
            club2Id);

    mockMvc
        .perform(
            post("/api/v1/players/" + playerId + "/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(buyPayloadClub2))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("O jogador já possui vínculo com outro clube."));

    // Step 3: Clube 1 vende Jogador (200 OK com multa de fidelidade)
    mockMvc
        .perform(post("/api/v1/players/" + playerId + "/sell"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.player_id").value(playerId))
        .andExpect(jsonPath("$.club_id").value(club1Id))
        .andExpect(jsonPath("$.loyalty_fine").exists());

    // Step 4: Clube 1 tenta recomprar o jogador que ele mesmo vendeu (409 Conflict)
    mockMvc
        .perform(
            post("/api/v1/players/" + playerId + "/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(buyPayload))
        .andExpect(status().isConflict())
        .andExpect(
            jsonPath("$.message")
                .value("Um clube não pode recomprar um jogador que ele mesmo já vendeu."));

    // Step 5: Consultar Histórico de Transações do Clube 1 (200 OK)
    mockMvc
        .perform(get("/api/v1/clubs/" + club1Id + "/transactions").param("type", "COMPRA,VENDA"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.summary").exists())
        .andExpect(jsonPath("$.transactions", hasSize(2)));

    // Step 6: Exportação do Histórico em formato CSV (200 OK)
    mockMvc
        .perform(get("/api/v1/clubs/" + club1Id + "/transactions/export").param("type", "VENDA"))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Type", containsString("text/csv")))
        .andExpect(
            content()
                .string(
                    containsString(
                        "data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa")));
  }

  // --- MÓDULO 4: LIGA (ESCALAÇÃO, PARTIDAS E CLASSIFICAÇÃO) ---

  @Test
  @DisplayName(
      "4.1 Escalação, 4.3 Simulação de Partida, 4.4 Validações e 4.5 Tabela de Classificação")
  void shouldExecuteFullMatchAndLineupFlow() throws Exception {
    // Step A: Cadastrar Clube Mandante e Clube Visitante
    MvcResult homeClubRes =
        mockMvc
            .perform(
                post("/api/v1/clubs")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{ \"name\": \"Águias FC\", \"acronym\": \"AGU\" }"))
            .andExpect(status().isCreated())
            .andReturn();
    Long homeClubId =
        objectMapper.readTree(homeClubRes.getResponse().getContentAsString()).get("id").asLong();

    MvcResult awayClubRes =
        mockMvc
            .perform(
                post("/api/v1/clubs")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{ \"name\": \"Delta FC\", \"acronym\": \"DLT\" }"))
            .andExpect(status().isCreated())
            .andReturn();
    Long awayClubId =
        objectMapper.readTree(awayClubRes.getResponse().getContentAsString()).get("id").asLong();

    // Step B: Cadastrar e Comprar 5 Jogadores para o Clube Mandante (1 GOL, 2 ZAG, 1 MEI, 1 ATA)
    List<Long> homePlayerIds = createAndBuySquad(homeClubId, "Mandante");

    // Step C: Cadastrar e Comprar 5 Jogadores para o Clube Visitante
    List<Long> awayPlayerIds = createAndBuySquad(awayClubId, "Visitante");

    // Step 1: Definir Escalação para Clube Mandante na Formação "2-1-1" (200 OK)
    String homeLineupJson =
        String.format(
            """
            {
                "formation": "2-1-1",
                "player_ids": %s
            }
            """,
            objectMapper.writeValueAsString(homePlayerIds));

    mockMvc
        .perform(
            put("/api/v1/clubs/" + homeClubId + "/lineup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(homeLineupJson))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.is_complete").value(true));

    // Step 2: Definir Escalação para Clube Visitante
    String awayLineupJson =
        String.format(
            """
            {
                "formation": "2-1-1",
                "player_ids": %s
            }
            """,
            objectMapper.writeValueAsString(awayPlayerIds));

    mockMvc
        .perform(
            put("/api/v1/clubs/" + awayClubId + "/lineup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(awayLineupJson))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.is_complete").value(true));

    // Step 3: Consultar Escalação do Mandante (200 OK)
    mockMvc
        .perform(get("/api/v1/clubs/" + homeClubId + "/lineup"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.formation").value("2-1-1"))
        .andExpect(jsonPath("$.players", hasSize(5)));

    // Step 4: Validação - Mandante igual ao Visitante (400 Bad Request)
    String invalidMatchPayload =
        String.format(
            """
            { "home_club_id": %d, "away_club_id": %d }
            """,
            homeClubId, homeClubId);

    mockMvc
        .perform(
            post("/api/v1/matches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidMatchPayload))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.message").value("O clube mandante não pode ser igual ao clube visitante."));

    // Step 5: Simular Partida Válida entre Mandante e Visitante (201 Created)
    String validMatchPayload =
        String.format(
            """
            { "home_club_id": %d, "away_club_id": %d }
            """,
            homeClubId, awayClubId);

    MvcResult matchResult =
        mockMvc
            .perform(
                post("/api/v1/matches")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validMatchPayload))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"))
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.duels", hasSize(6)))
            .andReturn();
    Long matchId =
        objectMapper.readTree(matchResult.getResponse().getContentAsString()).get("id").asLong();

    // Step 6: Consultar Detalhes da Partida por ID (200 OK)
    mockMvc
        .perform(get("/api/v1/matches/" + matchId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(matchId));

    // Step 7: Consultar Tabela de Classificação Atualizada (200 OK)
    mockMvc
        .perform(get("/api/v1/standings"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].matches_played").value(1))
        .andExpect(jsonPath("$[1].matches_played").value(1));
  }

  // --- MÓDULO 5: TRATAMENTO DE ERROS GLOBAIS ---

  @Test
  @DisplayName("5.1 Deve retornar 404 Not Found com campo message para rota inexistente")
  void shouldReturn404ForNonExistentRoute() throws Exception {
    mockMvc
        .perform(get("/api/v1/rota-inexistente"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").exists());
  }

  @Test
  @DisplayName("5.2 Deve retornar 404 Not Found para ID não numérico na URL")
  void shouldReturn404ForNonNumericIdInUrl() throws Exception {
    mockMvc
        .perform(get("/api/v1/players/abc"))
        .andExpect(status().isNotFound())
        .andExpect(
            jsonPath("$.message").value("Recurso não encontrado para o identificador informado."));
  }

  // --- MÉTODOS AUXILIARES ---

  private List<Long> createAndBuySquad(Long clubId, String prefix) throws Exception {
    List<Long> playerIds = new ArrayList<>();
    String[] positions = {"GOL", "ZAG", "ZAG", "MEI", "ATA"};
    String[] nomes = {"Um", "Dois", "Tres", "Quatro", "Cinco"};

    for (int i = 0; i < 5; i++) {
      String name = String.format("%s Jogador %s", prefix, nomes[i]);
      String pos = positions[i];

      // Cadastrar Jogador com atributos de custo baixo para permitir a compra
      String playerPayload =
          String.format(
              """
              {
                  "name": "%s", "position": "%s", "agility": 70, "age": 22,
                  "pace": 50, "shooting": 50, "passing": 50, "dribbling": 50, "defending": 50, "physical": 50, "potential": 60
              }
              """,
              name, pos);

      MvcResult playerResult =
          mockMvc
              .perform(
                  post("/api/v1/players")
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(playerPayload))
              .andExpect(status().isCreated())
              .andReturn();
      Long playerId =
          objectMapper.readTree(playerResult.getResponse().getContentAsString()).get("id").asLong();

      // Comprar Jogador para o Clube
      String buyPayload =
          String.format(
              """
              { "club_id": %d, "loyalty_until": "2027-03-02T10:15-03:00" }
              """,
              clubId);

      mockMvc
          .perform(
              post("/api/v1/players/" + playerId + "/buy")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(buyPayload))
          .andExpect(status().isOk());

      playerIds.add(playerId);
    }
    return playerIds;
  }
}
