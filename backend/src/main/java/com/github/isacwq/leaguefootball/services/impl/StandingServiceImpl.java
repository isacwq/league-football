package com.github.isacwq.leaguefootball.services.impl;

import com.github.isacwq.leaguefootball.dtos.StandingResponseDto;
import com.github.isacwq.leaguefootball.entities.ClubEntity;
import com.github.isacwq.leaguefootball.repositories.ClubRepository;
import com.github.isacwq.leaguefootball.repositories.MatchRepository;
import com.github.isacwq.leaguefootball.services.StandingService;
import java.text.Normalizer;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementação do cálculo e consolidação da tabela de classificação geral da liga.
 */
@Service
public class StandingServiceImpl implements StandingService {

  private final ClubRepository clubRepository;
  private final MatchRepository matchRepository;

  public StandingServiceImpl(ClubRepository clubRepository, MatchRepository matchRepository) {
    this.clubRepository = clubRepository;
    this.matchRepository = matchRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public List<StandingResponseDto> getStandings() {
    List<ClubEntity> clubs = clubRepository.findAll();
    var matches = matchRepository.findAll();

    Map<Long, StandingResponseDto> stats = new HashMap<>();
    for (ClubEntity c : clubs) {
      stats.put(
          c.getId(),
          new StandingResponseDto(
              0, c.getId(), c.getName(), c.getAcronym(), 0, 0, 0, 0, 0, 0, 0, 0));
    }

    // RN21: Consolidação da pontuação e estatísticas dos clubes a partir das partidas disputadas.
    for (var m : matches) {
      var home = stats.get(m.getHomeClub().getId());
      var away = stats.get(m.getAwayClub().getId());

      if (home != null && away != null) {
        int hPts =
            m.getHomeGoals() > m.getAwayGoals()
                ? 3
                : (m.getHomeGoals().equals(m.getAwayGoals()) ? 1 : 0);
        int aPts =
            m.getAwayGoals() > m.getHomeGoals()
                ? 3
                : (m.getHomeGoals().equals(m.getAwayGoals()) ? 1 : 0);

        stats.put(
            home.clubId(),
            new StandingResponseDto(
                0,
                home.clubId(),
                home.clubName(),
                home.clubAcronym(),
                home.points() + hPts,
                home.matchesPlayed() + 1,
                home.wins() + (hPts == 3 ? 1 : 0),
                home.draws() + (hPts == 1 ? 1 : 0),
                home.losses() + (hPts == 0 ? 1 : 0),
                home.goalsFor() + m.getHomeGoals(),
                home.goalsAgainst() + m.getAwayGoals(),
                (home.goalsFor() + m.getHomeGoals()) - (home.goalsAgainst() + m.getAwayGoals())));

        stats.put(
            away.clubId(),
            new StandingResponseDto(
                0,
                away.clubId(),
                away.clubName(),
                away.clubAcronym(),
                away.points() + aPts,
                away.matchesPlayed() + 1,
                away.wins() + (aPts == 3 ? 1 : 0),
                away.draws() + (aPts == 1 ? 1 : 0),
                away.losses() + (aPts == 0 ? 1 : 0),
                away.goalsFor() + m.getAwayGoals(),
                away.goalsAgainst() + m.getHomeGoals(),
                (away.goalsFor() + m.getAwayGoals()) - (away.goalsAgainst() + m.getHomeGoals())));
      }
    }

    // RN21: Ordenação oficial por Pontos, Saldo de Gols, Gols Pró e Ordem Alfabética (Unicode) para
    // desempate.
    List<StandingResponseDto> list = new ArrayList<>(stats.values());
    list.sort(
        (s1, s2) -> {
          if (!s2.points().equals(s1.points())) return s2.points().compareTo(s1.points());
          if (!s2.goalDifference().equals(s1.goalDifference()))
            return s2.goalDifference().compareTo(s1.goalDifference());
          if (!s2.goalsFor().equals(s1.goalsFor())) return s2.goalsFor().compareTo(s1.goalsFor());

          String n1 =
              Normalizer.normalize(s1.clubName(), Normalizer.Form.NFD)
                  .replaceAll("\\p{M}", "")
                  .toLowerCase();
          String n2 =
              Normalizer.normalize(s2.clubName(), Normalizer.Form.NFD)
                  .replaceAll("\\p{M}", "")
                  .toLowerCase();
          int nameComp = n1.compareTo(n2);
          return nameComp != 0 ? nameComp : s1.clubId().compareTo(s2.clubId());
        });

    List<StandingResponseDto> result = new ArrayList<>();
    for (int i = 0; i < list.size(); i++) {
      var item = list.get(i);
      result.add(
          new StandingResponseDto(
              i + 1,
              item.clubId(),
              item.clubName(),
              item.clubAcronym(),
              item.points(),
              item.matchesPlayed(),
              item.wins(),
              item.draws(),
              item.losses(),
              item.goalsFor(),
              item.goalsAgainst(),
              item.goalDifference()));
    }

    return result;
  }
}
