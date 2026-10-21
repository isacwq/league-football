package com.github.isacwq.leaguefootball.services.impl;

import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.enums.Position;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.OffsetDateTime;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

/**
 * Serviço responsável por todos os cálculos matemáticos e de regras de negócio do sistema.
 */
@Service
public class BusinessCalculatorService {

  // RN06: Ponderação dos atributos táticos conforme a posição em campo para determinar a força
  // geral (Overall).
  public int calculateOverall(
      Position position,
      int pace,
      int shooting,
      int passing,
      int dribbling,
      int defending,
      int physical) {
    double raw =
        switch (position) {
          case GOL -> (pace * 10 + passing * 20 + defending * 40 + physical * 30) / 100.0;
          case ZAG -> (pace * 10 + passing * 15 + defending * 45 + physical * 30) / 100.0;
          case LAT ->
              (pace * 25 + passing * 20 + dribbling * 15 + defending * 25 + physical * 15) / 100.0;
          case MEI ->
              (pace * 10
                      + shooting * 15
                      + passing * 35
                      + dribbling * 25
                      + defending * 5
                      + physical * 10)
                  / 100.0;
          case ATA ->
              (pace * 20 + shooting * 40 + passing * 10 + dribbling * 20 + physical * 10) / 100.0;
        };
    return (int) Math.round(raw);
  }

  // RN06: Cálculo do valor base inicial de mercado no cadastro com base na idade, potencial e força
  // geral.
  public BigDecimal calculateBaseValue(int overall, int potential, int ageAtRegister) {
    double overallPart = 0.0;
    if (overall >= 41 && overall <= 60) {
      overallPart = (overall - 40) * 0.50;
    } else if (overall >= 61 && overall <= 75) {
      overallPart = (20 * 0.50) + (overall - 60) * 2.00;
    } else if (overall >= 76) {
      overallPart = (20 * 0.50) + (15 * 2.00) + (overall - 75) * 6.00;
    }

    if (ageAtRegister <= 21) { // RN06: Bonificação de jovem promessa no cadastro
      overallPart = overallPart * (100 + potential - overall) / 100.0;
    }

    BigDecimal baseValue = BigDecimal.valueOf(overallPart).setScale(2, RoundingMode.HALF_UP);
    return baseValue.compareTo(BigDecimal.ONE) < 0 ? BigDecimal.ONE.setScale(2) : baseValue;
  }

  // RN02-RN05: Avaliação do valor de mercado dinâmico refletindo desgaste físico, idade e agilidade
  // do atleta.
  public BigDecimal calculateMarketValue(
      BigDecimal baseValue, Condition condition, int agility, int age) {
    double conditionDiscount =
        switch (condition) {
          case APTO -> 0.0;
          case MAL_CONDICIONADO -> 15.0;
          case DOENTE -> 30.0;
        };

    if (condition != Condition.APTO) {
      if (agility >= 80) {
        conditionDiscount /= 2.0;
      } else if (agility <= 30) {
        conditionDiscount += 10.0;
      }
    }

    double ageAdjustment = age <= 21 ? 10.0 : (age >= 32 ? -10.0 : 0.0);

    double totalPercent = ageAdjustment - conditionDiscount;
    if (totalPercent < -40.0) totalPercent = -40.0; // RN05: Teto máximo de depreciação por idade

    BigDecimal factor =
        BigDecimal.valueOf(100.0 + totalPercent)
            .divide(BigDecimal.valueOf(100.0), 6, RoundingMode.HALF_UP);
    BigDecimal marketValue = baseValue.multiply(factor).setScale(2, RoundingMode.HALF_UP);

    return marketValue.compareTo(BigDecimal.ONE) < 0 ? BigDecimal.ONE.setScale(2) : marketValue;
  }

  // RN13: Taxa administrativa de 5% sobre a contratação de atleta livre.
  public BigDecimal calculatePurchaseFee(BigDecimal marketValue) {
    if (marketValue.compareTo(BigDecimal.valueOf(30.00)) <= 0) {
      return BigDecimal.ZERO.setScale(2);
    }

    return marketValue.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
  }

  // RN15: Penalidade financeira por rescisão antecipada proporcional aos dias do contrato de
  // fidelidade pendentes.
  public long calculateRemainingDays(@Nullable OffsetDateTime loyaltyUntil, OffsetDateTime now) {
    if (loyaltyUntil == null || !loyaltyUntil.isAfter(now)) {
      return 0;
    }

    long seconds = Duration.between(now, loyaltyUntil).getSeconds();
    return (long) Math.ceil(seconds / 86400.0);
  }

  public BigDecimal calculateLoyaltyPenalty(BigDecimal marketValue, long remainingDays) {
    if (remainingDays <= 0) return BigDecimal.ZERO.setScale(2);

    double rate = remainingDays <= 30 ? 0.05 : (remainingDays <= 180 ? 0.10 : 0.20);
    BigDecimal penalty =
        marketValue.multiply(BigDecimal.valueOf(rate)).setScale(2, RoundingMode.HALF_UP);

    BigDecimal cap =
        BigDecimal.valueOf(10.00); // RN15: Teto máximo de 10.00 moedas na multa de fidelidade
    return penalty.compareTo(cap) > 0 ? cap : penalty;
  }

  public int calculateLoyaltyPenaltyRate(long remainingDays) {
    if (remainingDays <= 0) return 0;
    if (remainingDays <= 30) return 5;
    if (remainingDays <= 180) return 10;
    return 20;
  }

  // RN16: Comissão progressiva da liga cobrada sobre o lucro obtido na venda do atleta.
  public BigDecimal calculateSalesCommission(BigDecimal profit) {
    if (profit.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO.setScale(2);

    BigDecimal ten = BigDecimal.valueOf(10.00);
    if (profit.compareTo(ten) <= 0) {
      return profit.multiply(BigDecimal.valueOf(0.10)).setScale(2, RoundingMode.HALF_UP);
    } else {
      BigDecimal firstTier = ten.multiply(BigDecimal.valueOf(0.10));
      BigDecimal remainingProfit = profit.subtract(ten);
      BigDecimal secondTier = remainingProfit.multiply(BigDecimal.valueOf(0.20));
      return firstTier.add(secondTier).setScale(2, RoundingMode.HALF_UP);
    }
  }
}
