package com.github.isacwq.leaguefootball.services;

import com.github.isacwq.leaguefootball.dtos.*;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.ResourceNotFoundException;

public interface PlayerService {

  /**
   * Consulta paginada com busca textual, ordenação e filtros combinados (RN07).
   */
  PlayerListResponseDto findAll(PlayerFilterParamsDto filters);

  /**
   * Busca os detalhes de um jogador por ID, calculando overall e valor de mercado (RN01-RN06).
   * @throws ResourceNotFoundException se o ID não existir (HTTP 404)
   */
  PlayerResponseDto findById(Long id);

  /**
   * Cadastra um novo jogador e calcula valor base e overall inicial.
   * @throws BusinessRuleException se descumprir limites de atributos ou idade (HTTP 409/400)
   */
  PlayerResponseDto create(CreatePlayerDto dto);

  /**
   * Atualiza dados cadastrais permitidos do jogador (RN08).
   * @throws BusinessRuleException se tentar alterar posição de jogador vinculado ou reduzir idade (HTTP 409)
   */
  PlayerResponseDto update(Long id, UpdatePlayerDto dto);

  /**
   * Altera a condição física do jogador (APTO, MAL_CONDICIONADO, DOENTE).
   * @throws BusinessRuleException se a transição de condição for inválida (HTTP 409)
   */
  PlayerResponseDto updateCondition(Long id, UpdateConditionDto dto);

  /**
   * Realiza a exclusão lógica do jogador (RN09).
   * @throws BusinessRuleException se o jogador estiver vinculado a um clube (HTTP 409)
   */
  void delete(Long id);
}
