package com.github.isacwq.leaguefootball.exceptions;

import com.github.isacwq.leaguefootball.dtos.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  // Mapeamento de falhas de contrato HTTP, validações de DTO e parâmetros com formato incorreto.
  @ExceptionHandler({
    MethodArgumentNotValidException.class,
    BindException.class,
    HandlerMethodValidationException.class,
  })
  public ResponseEntity<ErrorResponseDto> handleValidation(Exception ex) {
    String detail = "Dados de entrada inválidos ou parâmetros de requisição incorretos.";
    if (ex instanceof MethodArgumentNotValidException manv) {
      detail =
          manv.getBindingResult().getFieldErrors().stream()
              .map(
                  error ->
                      String.format(
                          "O campo '%s' %s.", error.getField(), error.getDefaultMessage()))
              .findFirst()
              .orElse(detail);
    } else if (ex instanceof BindException be) {
      detail =
          be.getBindingResult().getFieldErrors().stream()
              .map(
                  error ->
                      String.format(
                          "O parâmetro '%s' recebeu um valor inválido.", error.getField()))
              .findFirst()
              .orElse("Parâmetros de requisição inválidos.");
    }
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDto(detail));
  }

  // Mapeamento de buscas por identificadores ou recursos inexistentes na base de dados.
  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ErrorResponseDto> handleTypeMismatch(
      MethodArgumentTypeMismatchException ex) {
    // Regra V8: Identificadores não numéricos em rotas da API são mapeados para recurso
    // inexistente.
    if ("id".equalsIgnoreCase(ex.getName()) || ex.getName().endsWith("Id")) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(new ErrorResponseDto("Recurso não encontrado para o identificador informado."));
    }

    // Demais parâmetros inválidos em query params (ex: page=abc)
    String detail =
        String.format("O parâmetro '%s' recebeu um valor inválido ou em branco.", ex.getName());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponseDto(detail));
  }

  // 400 Bad Request: JSON malformado ou Enum inválido (Regra V1 e V5)
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErrorResponseDto> handleJsonError(HttpMessageNotReadableException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponseDto("Corpo da requisição inválido ou valor de enum incorreto."));
  }

  // 404 Not Found: Recurso/ID não encontrado no banco (Regra V8)
  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<ErrorResponseDto> handleNoHandlerFound(NoHandlerFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponseDto("Recurso ou caminho inexistente."));
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

  // 400 Bad Request: Validação manual de parâmetros / limites (HTTP 400 Bad Request)
  @ExceptionHandler(InvalidParameterException.class)
  public ResponseEntity<ErrorResponseDto> handleInvalidParameter(InvalidParameterException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponseDto(ex.getMessage()));
  }

  // 400 Bad Request: Ordenação com campo inexistente ou argumento ilegal
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponseDto> handleIllegalArgument(Exception ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponseDto("Parâmetro ou valor de ordenação inválido."));
  }

  // 500 Internal Server Error: Tratamento genérico para exceções não capturadas
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponseDto> handleGenericException(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ErrorResponseDto("Ocorreu um erro interno inesperado no servidor."));
  }
}
