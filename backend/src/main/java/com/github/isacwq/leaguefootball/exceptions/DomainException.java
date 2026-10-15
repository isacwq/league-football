package com.github.isacwq.leaguefootball.exceptions;

public abstract class DomainException extends RuntimeException {
  protected DomainException(String message) {
    super(message);
  }
}
