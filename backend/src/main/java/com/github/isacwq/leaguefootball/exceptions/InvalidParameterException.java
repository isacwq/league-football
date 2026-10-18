package com.github.isacwq.leaguefootball.exceptions;

/**
 * Exceção lançada quando os parâmetros de consulta (Query Params) ou atributos de DTO
 * possuem valores inválidos, limites incoerentes ou combinações contraditórias (HTTP 400 Bad Request).
 */
public class InvalidParameterException extends RuntimeException {

  public InvalidParameterException(String message) {
    super(message);
  }
}
