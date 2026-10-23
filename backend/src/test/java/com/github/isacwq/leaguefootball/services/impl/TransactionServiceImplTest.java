package com.github.isacwq.leaguefootball.services.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.github.isacwq.leaguefootball.entities.ClubEntity;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import com.github.isacwq.leaguefootball.entities.TransactionEntity;
import com.github.isacwq.leaguefootball.enums.TransactionType;
import com.github.isacwq.leaguefootball.repositories.ClubRepository;
import com.github.isacwq.leaguefootball.repositories.TransactionRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

  @Mock private TransactionRepository transactionRepository;
  @Mock private ClubRepository clubRepository;

  @InjectMocks private TransactionServiceImpl transactionService;

  @Test
  @DisplayName("Deve gerar CSV com cabeçalho obrigatório e separadores de ponto e vírgula (RN18)")
  void generateCsv_Success() {
    ClubEntity club = new ClubEntity();
    club.setId(1L);

    PlayerEntity player = new PlayerEntity();
    player.setId(10L);

    OffsetDateTime now = OffsetDateTime.parse("2026-10-16T15:00:00-03:00");
    TransactionEntity tx =
        new TransactionEntity(
            club,
            player,
            "Neymar Jr",
            TransactionType.COMPRA,
            BigDecimal.valueOf(100.00), // valor
            BigDecimal.valueOf(5.00), // taxa_ou_comissao
            BigDecimal.ZERO, // multa
            null, // lucro (null em COMPRA)
            BigDecimal.valueOf(-105.00), // variacao_caixa
            now);

    when(clubRepository.existsById(1L)).thenReturn(true);
    when(transactionRepository.findFiltered(
            1L, List.of(TransactionType.COMPRA, TransactionType.VENDA), null))
        .thenReturn(List.of(tx));

    String csv = transactionService.generateCsv(1L, null, null);

    assertThat(csv)
        .startsWith("data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa");
    assertThat(csv).contains("COMPRA;Neymar Jr;100,00;5,00;0,00;;-105,00");
  }

  @Test
  @DisplayName(
      "Deve preservar pontos em nomes de jogadores e formatar decimais com vírgula no CSV (RN18)")
  void generateCsv_PreservesDotsInPlayerNamesAndFormatsDecimalsWithComma() {
    ClubEntity club = new ClubEntity();
    club.setId(1L);

    PlayerEntity player1 = new PlayerEntity();
    player1.setId(10L);

    PlayerEntity player2 = new PlayerEntity();
    player2.setId(20L);

    OffsetDateTime now = OffsetDateTime.parse("2026-10-16T15:00:00-03:00");

    // Transação de VENDA com ponto no nome do jogador ("J. Santos")
    TransactionEntity txVenda =
        new TransactionEntity(
            club,
            player1,
            "J. Santos",
            TransactionType.VENDA,
            BigDecimal.valueOf(40.00),
            BigDecimal.valueOf(0.30),
            BigDecimal.valueOf(4.00),
            BigDecimal.valueOf(3.00),
            BigDecimal.valueOf(35.70),
            now);

    // Transação de COMPRA com aspas e ponto e vírgula no nome ("Meia; \"Lua\" Silva")
    TransactionEntity txCompra =
        new TransactionEntity(
            club,
            player2,
            "Meia; \"Lua\" Silva",
            TransactionType.COMPRA,
            BigDecimal.valueOf(37.00),
            BigDecimal.valueOf(1.85),
            BigDecimal.ZERO,
            null,
            BigDecimal.valueOf(-38.85),
            now);

    when(clubRepository.existsById(1L)).thenReturn(true);
    when(transactionRepository.findFiltered(
            1L, List.of(TransactionType.COMPRA, TransactionType.VENDA), null))
        .thenReturn(List.of(txVenda, txCompra));

    String csv = transactionService.generateCsv(1L, null, null);

    // Valida que o ponto em "J. Santos" foi PRESERVADO e os decimais usam vírgula
    assertThat(csv).contains("VENDA;J. Santos;40,00;0,30;4,00;3,00;35,70");

    // Valida o escaping de aspas/ponto-e-vírgula e o campo de lucro nulo (;;)
    assertThat(csv).contains("COMPRA;\"Meia; \"\"Lua\"\" Silva\";37,00;1,85;0,00;;-38,85");
  }
}
