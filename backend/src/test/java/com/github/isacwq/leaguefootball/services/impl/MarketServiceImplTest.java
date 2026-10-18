package com.github.isacwq.leaguefootball.services.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.github.isacwq.leaguefootball.dtos.BuyPlayerDto;
import com.github.isacwq.leaguefootball.dtos.BuyTransactionResponseDto;
import com.github.isacwq.leaguefootball.dtos.SellTransactionResponseDto;
import com.github.isacwq.leaguefootball.entities.ClubEntity;
import com.github.isacwq.leaguefootball.entities.ContractEntity;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import com.github.isacwq.leaguefootball.entities.TransactionEntity;
import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.ContractStatus;
import com.github.isacwq.leaguefootball.enums.TransactionType;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.repositories.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MarketServiceImplTest {

  @Mock private PlayerRepository playerRepository;
  @Mock private ClubRepository clubRepository;
  @Mock private TransactionRepository transactionRepository;
  @Mock private ContractRepository contractRepository;
  @Mock private LineupRepository lineupRepository;

  @Spy private BusinessCalculatorService calculator = new BusinessCalculatorService();

  @InjectMocks private MarketServiceImpl marketService;

  @Test
  @DisplayName("Deve comprar jogador livre com sucesso e atualizar caixa do clube (RN13)")
  void buyPlayer_Success() {
    PlayerEntity player = new PlayerEntity();
    player.setId(1L);
    player.setName("Meia Lua");
    player.setBaseValue(BigDecimal.valueOf(40.00));
    player.setCondition(Condition.APTO);
    player.setAgility(85);
    player.setAge(25);

    ClubEntity club = new ClubEntity();
    club.setId(1L);
    club.setName("Águias FC");
    club.setCash(BigDecimal.valueOf(300.00));

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));
    when(clubRepository.findById(1L)).thenReturn(Optional.of(club));
    when(transactionRepository.existsByClubIdAndPlayerIdAndType(1L, 1L, TransactionType.VENDA))
        .thenReturn(false);
    when(contractRepository.save(any(ContractEntity.class))).thenAnswer(i -> i.getArgument(0));
    when(transactionRepository.save(any(TransactionEntity.class)))
        .thenAnswer(
            i -> {
              TransactionEntity t = i.getArgument(0);
              t.setId(100L);
              return t;
            });

    BuyPlayerDto dto = new BuyPlayerDto(1L, OffsetDateTime.now().plusDays(30));

    BuyTransactionResponseDto response = marketService.buyPlayer(1L, dto);

    assertThat(response.transactionId()).isEqualTo(100L);
    assertThat(response.playerId()).isEqualTo(1L);
    assertThat(response.clubId()).isEqualTo(1L);
    assertThat(response.amount()).isEqualByComparingTo("40.00");
    assertThat(response.clubCashAfter()).isEqualByComparingTo("258.00");
    verify(playerRepository, times(1)).save(player);
    verify(clubRepository, times(1)).save(club);
  }

  @Test
  @DisplayName("Deve recusar compra quando o jogador já possui vínculo com outro clube (RN12)")
  void buyPlayer_WhenPlayerAlreadyHasClub_ThrowsException() {
    PlayerEntity player = new PlayerEntity();
    player.setId(1L);
    player.setClub(new ClubEntity());

    ClubEntity club = new ClubEntity();
    club.setId(2L);

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));
    when(clubRepository.findById(2L)).thenReturn(Optional.of(club));

    BuyPlayerDto dto = new BuyPlayerDto(2L, OffsetDateTime.now().plusDays(30));

    assertThatThrownBy(() -> marketService.buyPlayer(1L, dto))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("já possui vínculo com outro clube");
  }

  @Test
  @DisplayName(
      "Deve recusar compra quando o clube atinge o limite máximo de 12 jogadores no elenco (RN14)")
  void buyPlayer_WhenSquadLimitReached_ThrowsException() {
    PlayerEntity player = new PlayerEntity();
    player.setId(1L);

    ClubEntity club = new ClubEntity();
    club.setId(1L);
    List<PlayerEntity> squad = new ArrayList<>();
    for (int i = 0; i < 12; i++) {
      squad.add(new PlayerEntity());
    }
    club.setPlayers(squad);

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));
    when(clubRepository.findById(1L)).thenReturn(Optional.of(club));

    BuyPlayerDto dto = new BuyPlayerDto(1L, OffsetDateTime.now().plusDays(30));

    assertThatThrownBy(() -> marketService.buyPlayer(1L, dto))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("limite máximo de 12 jogadores");
  }

  @Test
  @DisplayName("Deve recusar recompra pelo mesmo clube que já vendeu o jogador (RN12)")
  void buyPlayer_WhenSameClubRepurchase_ThrowsException() {
    PlayerEntity player = new PlayerEntity();
    player.setId(1L);

    ClubEntity club = new ClubEntity();
    club.setId(1L);

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));
    when(clubRepository.findById(1L)).thenReturn(Optional.of(club));
    when(transactionRepository.existsByClubIdAndPlayerIdAndType(1L, 1L, TransactionType.VENDA))
        .thenReturn(true);

    BuyPlayerDto dto = new BuyPlayerDto(1L, OffsetDateTime.now().plusDays(30));

    assertThatThrownBy(() -> marketService.buyPlayer(1L, dto))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("não pode recomprar um jogador que ele mesmo já vendeu");
  }

  @Test
  @DisplayName("Deve recusar compra quando o custo total ultrapassa 50% do caixa do clube (RN13)")
  void buyPlayer_WhenCostExceedsFiftyPercentCash_ThrowsException() {
    PlayerEntity player = new PlayerEntity();
    player.setId(1L);
    player.setName("Jogador Caro");
    player.setBaseValue(BigDecimal.valueOf(200.00));
    player.setCondition(Condition.APTO);
    player.setAgility(50);
    player.setAge(25);

    ClubEntity club = new ClubEntity();
    club.setId(1L);
    club.setCash(BigDecimal.valueOf(300.00));

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));
    when(clubRepository.findById(1L)).thenReturn(Optional.of(club));

    BuyPlayerDto dto = new BuyPlayerDto(1L, OffsetDateTime.now().plusDays(30));

    assertThatThrownBy(() -> marketService.buyPlayer(1L, dto))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("passa do limite de 50% do caixa");
  }

  @Test
  @DisplayName(
      "Deve vender jogador com sucesso, creditando caixa e removendo do clube e da escalação (RN15,"
          + " RN16)")
  void sellPlayer_Success() {
    ClubEntity club = new ClubEntity();
    club.setId(1L);
    club.setName("Águias FC");
    club.setCash(BigDecimal.valueOf(250.00));

    PlayerEntity player = new PlayerEntity();
    player.setId(1L);
    player.setName("Meia Lua");
    player.setBaseValue(BigDecimal.valueOf(40.00));
    player.setCondition(Condition.APTO);
    player.setAgility(85);
    player.setAge(25);
    player.setClub(club);

    ContractEntity contract =
        new ContractEntity(
            player,
            club,
            BigDecimal.valueOf(40.00),
            OffsetDateTime.now().plusDays(10),
            ContractStatus.ATIVO,
            OffsetDateTime.now().minusDays(20));

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));
    when(contractRepository.findByPlayerIdAndStatus(1L, ContractStatus.ATIVO))
        .thenReturn(Optional.of(contract));
    when(transactionRepository.save(any(TransactionEntity.class)))
        .thenAnswer(
            i -> {
              TransactionEntity t = i.getArgument(0);
              t.setId(200L);
              return t;
            });

    SellTransactionResponseDto response = marketService.sellPlayer(1L);

    assertThat(response.transactionId()).isEqualTo(200L);
    assertThat(response.playerId()).isEqualTo(1L);
    assertThat(response.clubId()).isEqualTo(1L);
    assertThat(response.saleValue()).isEqualByComparingTo("40.00");
    assertThat(response.loyaltyFine()).isEqualByComparingTo("2.00");
    assertThat(response.clubCashAfter()).isEqualByComparingTo("288.00");
    assertThat(player.getClub()).isNull();
    verify(lineupRepository, times(1)).deleteByPlayerId(1L);
    verify(playerRepository, times(1)).save(player);
    verify(clubRepository, times(1)).save(club);
  }

  @Test
  @DisplayName("Deve recusar venda de jogador que já é livre (sem clube)")
  void sellPlayer_WhenFreePlayer_ThrowsException() {
    PlayerEntity player = new PlayerEntity();
    player.setId(1L);
    player.setClub(null);

    when(playerRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(player));

    assertThatThrownBy(() -> marketService.sellPlayer(1L))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("está livre e não pode ser vendido");
  }
}
