package com.github.isacwq.leaguefootball.services.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.github.isacwq.leaguefootball.dtos.CreateClubDto;
import com.github.isacwq.leaguefootball.entities.ClubEntity;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.repositories.ClubRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ClubServiceImplTest {

  @Mock private ClubRepository clubRepository;

  @Spy private BusinessCalculatorService calculator = new BusinessCalculatorService();

  @InjectMocks private ClubServiceImpl clubService;

  @Test
  @DisplayName("Deve cadastrar clube com caixa inicial de R$ 300,00 (RN10)")
  void createClub_Success() {
    CreateClubDto dto = new CreateClubDto("Tramways Sport Club", "TSC");

    when(clubRepository.count()).thenReturn(5L);
    when(clubRepository.existsByNameIgnoreCase("Tramways Sport Club")).thenReturn(false);
    when(clubRepository.existsByAcronymIgnoreCase("TSC")).thenReturn(false);
    when(clubRepository.save(any(ClubEntity.class)))
        .thenAnswer(
            invocation -> {
              ClubEntity club = invocation.getArgument(0);
              club.setId(1L);
              return club;
            });

    var result = clubService.create(dto);

    assertThat(result.id()).isEqualTo(1L);
    assertThat(result.name()).isEqualTo("Tramways Sport Club");
    assertThat(result.acronym()).isEqualTo("TSC");
    assertThat(result.cash()).isEqualByComparingTo("300.00");

    verify(clubRepository, times(1)).save(any(ClubEntity.class));
  }

  @Test
  @DisplayName(
      "Deve lançar BusinessRuleException quando a liga atinge o limite máximo de 20 clubes (RN10)")
  void createClub_WhenLimitReached_ThrowsException() {
    when(clubRepository.count()).thenReturn(20L); // Limite atingido

    CreateClubDto dto = new CreateClubDto("Novo Clube", "NVC");

    assertThatThrownBy(() -> clubService.create(dto))
        .isInstanceOf(BusinessRuleException.class)
        .hasMessageContaining("aceita no máximo 20 clubes");
  }
}
