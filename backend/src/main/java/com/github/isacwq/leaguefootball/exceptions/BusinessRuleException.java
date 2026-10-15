package com.github.isacwq.leaguefootball.exceptions;

/**
 * Exceção lançada quando uma regra de negócio do estudo de caso é violada (HTTP 409 Conflict).
 */
public class BusinessRuleException extends DomainException {

  public BusinessRuleException(String message) {
    super(message);
  }
}
