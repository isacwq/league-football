package com.github.isacwq.leaguefootball.services.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.github.isacwq.leaguefootball.dtos.CreatePlayerDto;
import com.github.isacwq.leaguefootball.dtos.PlayerResponseDto;
import com.github.isacwq.leaguefootball.dtos.UpdateConditionDto;
import com.github.isacwq.leaguefootball.dtos.UpdatePlayerDto;
import com.github.isacwq.leaguefootball.entities.ClubEntity;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Position;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.InvalidParameterException;
import com.github.isacwq.leaguefootball.repositories.LineupRepository;
import com.github.isacwq.leaguefootball.repositories.PlayerRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PlayerServiceImplTest {

  @Mock private PlayerRepository playerRepository;

  @Mock private LineupRepository lineupRepository;

  @Spy private BusinessCalculatorService calculator = new BusinessCalculatorService();

  @InjectMocks private PlayerServiceImpl playerService;

  @Test
  @DisplayName("Deve cadastrar jogador com sucesso e retornar DTO preenchido")
  void createPlayer_Success() {
    CreatePlayerDto dto =
        new CreatePlayerDto("Gabriel Barbosa", Position.ATA, 80, 26, 85, 88, 75, 82, 35, 78, 88);
    when(playerRepository.save(any(PlayerEntity.class)))
        .thenAnswer(
            i -> {
              PlayerEntity p = i.getArgument(0);
              p.setId(1L);
              return p;
            });

    var result = playerService.create(dto);

    assertThat(result.id()).isEqualTo(1L);
    assertThat(result.name()).isEqualTo("Gabriel Barbosa");
    assertThat(result.condition()).isEqualTo(Condition.APTO);
    verify(playerRepository, times(1)).save(any(PlayerEntity.class));
  }

  @Test
  @DisplayName("Deve lançar InvalidParameterException ao tentar cadastrar nome com números (V4)")
  void createPlayer_WhenNameContainsDigits_ThrowsException() {
    CreatePlayerDto dto =
        new CreatePlayerDto("Jogador 1", Position.ATA, 80, 22, 70, 70, 70, 70, 40, 70, 80);

    assertThatThrownBy(() -> playerService.create(dto))
        .isInstanceOf(InvalidParameterException.class)
        .hasMessageContaining("não pode conter dígitos");
  }

  @Test
  @DisplayName(
      "Deve lançar InvalidParameterException ao tentar cadastrar nome com menos de duas palavras"
          + " (V4)")
  void createPlayer_WhenNameHasOneWord_ThrowsException() {
    CreatePlayerDto dto =
        new CreatePlayerDto("Gabriel", Position.ATA, 80, 22, 70, 70, 70, 70, 40, 70, 80);

    assertThatThrownBy(() -> playerService.create(dto))
        .isInstanceOf(InvalidParameterException.class)
        .hasMessageContaining("pelo menos duas palavras");
  }

  @Test
  @DisplayName(
      "Deve lançar InvalidParameterException para agilidade > 85 em atletas com 35 anos ou mais")
  void createPlayer_WhenAgeOver35AndAgilityOver85_ThrowsException() {
    CreatePlayerDto dto =
        new CreatePlayerDto("Jogador Experiente", Position.ZAG, 88, 36, 60, 50, 70, 60, 85, 70, 85);

    assertThatThrownBy(() -> playerService.create(dto))
        .isInstanceOf(InvalidParameterException.class)
        .hasMessageContaining("agilidade não pode ultrapassar 85");
  }

  @Test
  @DisplayName(
      "Deve lançar InvalidParameterException para potencial diferente do maior atributo em atletas"
          + " com 33 anos ou mais (RN06)")
  void createPlayer_WhenAgeOver33AndPotentialNotMaxAttribute_ThrowsException() {
    // Maior atributo tático é 85 (pace), potencial informado é 90 (diferente de 85)
    CreatePlayerDto dto =
        new CreatePlayerDto("Atleta Veterano", Position.MEI, 80, 34, 85, 70, 80, 75, 50, 65, 90);

    assertThatThrownBy(() -> playerService.create(dto))
        .isInstanceOf(InvalidParameterException.class)
        .hasMessageContaining("deve ser exatamente igual ao maior");
  }

  @Test
  @DisplayName(
      "Deve lançar InvalidParameterException quando a soma dos seis atributos ultrapassa 480"
          + " pontos")
  void createPlayer_WhenSumAttributesExceeds480_ThrowsException() {
    // Soma = 90 + 90 + 90 + 90 + 90 + 90 = 540 (> 480)
    CreatePlayerDto dto =
        new CreatePlayerDto("Atleta Super", Position.ATA, 90, 20, 90, 90, 90, 90, 90, 90, 95);

    assertThatThrownBy(() -> playerService.create(dto))
        .isInstanceOf(InvalidParameterException.class)
        .hasMessageContaining("não pode ultrapassar 480 pontos");
  }

  @Test
  @DisplayName(
      "Deve lançar InvalidParameterException quando o potencial é menor que o maior atributo"
          + " tático")
  void createPlayer_WhenPotentialLessThanMaxAttribute_ThrowsException() {
    // Maior atributo é 85 (pace), mas potencial informado é 80
    CreatePlayerDto dto =
        new CreatePlayerDto("Atleta Errado", Position.ATA, 80, 22, 85, 70, 70, 70, 40, 70, 80);

    assertThatThrownBy(() -> playerService.create(dto))
        .isInstanceOf(InvalidParameterException.class)
        .hasMessageContaining("potencial não pode ser menor");
  }

  @Test
  @DisplayName(
      "Deve lançar BusinessRuleException ao tentar alterar posição de jogador vinculado a um clube"
          + " (RN08)")
  void updatePlayer_WhenInClubAndChangesPosition_ThrowsException() {
    PlayerEntity player = new PlayerEntity();
    player.setId(1L);
    player.setPosition(Position.ATA);
    player.setAge(25);
    player.setClub(new ClubEntity());

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));

    UpdatePlayerDto dto = new UpdatePlayerDto("Novo Nome", Position.MEI, 80, 25);

    assertThatThrownBy(() -> playerService.update(1L, dto))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("pertencente a um clube não pode alterar de posição");
  }

  @Test
  @DisplayName("Deve lançar BusinessRuleException ao tentar reduzir a idade do jogador (RN08)")
  void updatePlayer_WhenAgeReduced_ThrowsException() {
    PlayerEntity player = new PlayerEntity();
    player.setId(1L);
    player.setPosition(Position.ATA);
    player.setAge(25);

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));

    UpdatePlayerDto dto = new UpdatePlayerDto("Novo Nome", Position.ATA, 80, 20);

    assertThatThrownBy(() -> playerService.update(1L, dto))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("idade do jogador não pode ser reduzida");
  }

  @Test
  @DisplayName(
      "Deve lançar BusinessRuleException ao tentar alterar condição de DOENTE diretamente para APTO"
          + " (RN08)")
  void updateCondition_FromDoenteToApto_ThrowsException() {
    PlayerEntity player = new PlayerEntity();
    player.setId(1L);
    player.setCondition(Condition.DOENTE);

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));

    UpdateConditionDto dto = new UpdateConditionDto(Condition.APTO);

    assertThatThrownBy(() -> playerService.updateCondition(1L, dto))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("não pode alterar diretamente para APTO");
  }

  @Test
  @DisplayName("Deve remover jogador da escalação ao passar para a condição DOENTE")
  void updateCondition_ToDoente_RemovesFromLineup() {
    PlayerEntity player = new PlayerEntity();
    player.setId(1L);
    player.setName("Jogador Teste");
    player.setPosition(Position.ATA);
    player.setAgility(70);
    player.setAge(25);
    player.setPace(80);
    player.setShooting(85);
    player.setPassing(70);
    player.setDribbling(75);
    player.setDefending(40);
    player.setPhysical(70);
    player.setPotential(85);
    player.setBaseValue(BigDecimal.valueOf(50.00));
    player.setCondition(Condition.APTO);

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));
    when(playerRepository.save(any(PlayerEntity.class))).thenAnswer(i -> i.getArgument(0));

    UpdateConditionDto dto = new UpdateConditionDto(Condition.DOENTE);
    PlayerResponseDto response = playerService.updateCondition(1L, dto);

    assertThat(response.condition()).isEqualTo(Condition.DOENTE);
    verify(lineupRepository, times(1)).deleteByPlayerId(1L);
  }

  @Test
  @DisplayName("Deve lançar BusinessRuleException ao tentar excluir jogador com clube (RN09)")
  void delete_WhenPlayerHasClub_ThrowsException() {
    PlayerEntity player = new PlayerEntity();
    player.setId(1L);
    player.setClub(new ClubEntity());

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));

    assertThatThrownBy(() -> playerService.delete(1L))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("pertencente a um clube não pode ser excluído");
  }
}
