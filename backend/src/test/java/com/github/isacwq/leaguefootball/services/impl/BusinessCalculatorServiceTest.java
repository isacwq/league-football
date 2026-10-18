package com.github.isacwq.leaguefootball.services.impl;

import static org.assertj.core.api.Assertions.assertThat;

import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Position;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BusinessCalculatorServiceTest {

  private BusinessCalculatorService calculator;

  @BeforeEach
  void setUp() {
    calculator = new BusinessCalculatorService();
  }

  @Test
  @DisplayName(
      "Deve calcular overall do Atacante com pesos específicos (40% chute, 20% ritmo, 20% driblar,"
          + " 10% passe, 10% físico)")
  void calculateOverall_ForAtacante() {
    // pace=80, shooting=90, passing=70, dribbling=85, defending=40, physical=75
    int overall = calculator.calculateOverall(Position.ATA, 80, 90, 70, 85, 40, 75);
    // (80*0.2) + (90*0.4) + (70*0.1) + (85*0.2) + (75*0.1) = 16 + 36 + 7 + 17 + 7.5 = 83.5 -> 84
    assertThat(overall).isEqualTo(84);
  }

  @Test
  @DisplayName(
      "Deve aplicar desconto de 15% no valor de mercado para jogador MAL_CONDICIONADO com agilidade"
          + " normal")
  void calculateMarketValue_ForMalCondicionado() {
    BigDecimal baseValue = BigDecimal.valueOf(100.00);
    BigDecimal marketValue =
        calculator.calculateMarketValue(baseValue, Condition.MAL_CONDICIONADO, 50, 25);

    // 100 - 15% = 85.00
    assertThat(marketValue).isEqualByComparingTo("85.00");
  }

  @Test
  @DisplayName("Deve limitar a multa por rescisão antecipada ao teto máximo de 10.00 moedas")
  void calculateLoyaltyPenalty_CapAtTen() {
    BigDecimal marketValue = BigDecimal.valueOf(100.00);
    long remainingDays = 200; // Alíquota de 20% -> 20.00

    BigDecimal penalty = calculator.calculateLoyaltyPenalty(marketValue, remainingDays);

    assertThat(penalty).isEqualByComparingTo("10.00"); // Teto de 10.00
  }

  @Test
  @DisplayName(
      "Deve calcular comissão progressiva de venda (10% sobre primeiros 10.00 de lucro e 20% sobre"
          + " o excedente)")
  void calculateSalesCommission_ProgressiveTiers() {
    BigDecimal profit = BigDecimal.valueOf(20.00); // 10.00 (Tier 1) + 10.00 (Tier 2)

    BigDecimal commission = calculator.calculateSalesCommission(profit);

    // Tier 1: 10 * 0.10 = 1.00 | Tier 2: 10 * 0.20 = 2.00 | Total = 3.00
    assertThat(commission).isEqualByComparingTo("3.00");
  }
}
