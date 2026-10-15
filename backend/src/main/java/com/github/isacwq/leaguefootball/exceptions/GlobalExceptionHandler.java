package com.github.isacwq.leaguefootball.exceptions;

import com.github.isacwq.leaguefootball.dtos.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  // 400 Bad Request: DTO inválido / Bean Validation
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponseDto> handleValidation(MethodArgumentNotValidException ex) {
    String detail =
        ex.getBindingResult().getFieldErrors().stream()
            .map(err -> err.getField() + " " + err.getDefaultMessage())
            .findFirst()
            .orElse("Dados de entrada inválidos.");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDto(detail));
  }

  // 400 Bad Request: JSON malformado ou Enum inválido (Regra V1 e V5)
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErrorResponseDto> handleJsonError(HttpMessageNotReadableException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponseDto("Corpo da requisição inválido ou valor de enum incorreto."));
  }

  // 404 Not Found: Recurso/ID não encontrado no banco (Regra V8)
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponseDto> handleNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDto(ex.getMessage()));
  }

  // 409 Conflict: Regra de negócio violada (Regra V9)
  @ExceptionHandler(BusinessRuleException.class)
  public ResponseEntity<ErrorResponseDto> handleBusinessRule(BusinessRuleException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseDto(ex.getMessage()));
  }
}
