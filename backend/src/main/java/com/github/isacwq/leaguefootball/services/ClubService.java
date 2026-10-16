package com.github.isacwq.leaguefootball.services;

import com.github.isacwq.leaguefootball.dtos.ClubDetailResponseDto;
import com.github.isacwq.leaguefootball.dtos.ClubSimpleResponseDto;
import com.github.isacwq.leaguefootball.dtos.CreateClubDto;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.ResourceNotFoundException;
import java.util.List;

public interface ClubService {

  /**
   * Lista todos os clubes cadastrados com ordenação por nome ou patrimônio líquido.
   */
  List<ClubSimpleResponseDto> findAll(String sort);

  /**
   * Cadastra um novo clube com caixa inicial de R$ 300,00 (RN10).
   * @throws BusinessRuleException se nome ou sigla já existirem (HTTP 409)
   */
  ClubSimpleResponseDto create(CreateClubDto dto);

  /**
   * Exibe o detalhamento do clube, caixa, patrimônio líquido e elenco ordenado (RN11).
   * @throws ResourceNotFoundException se o clube não for encontrado (HTTP 404)
   */
  ClubDetailResponseDto findDetailById(Long id);
}
