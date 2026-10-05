package com.pitcc.exception;

import com.pitcc.dto.ApiErrorResponse;
import com.pitcc.dto.ApiErrorResponse.FieldErrorResponse;
import com.pitcc.integration.catalog.ExternalApiException;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
    List<FieldErrorResponse> fields =
        exception.getBindingResult().getFieldErrors().stream()
            .map(error -> new FieldErrorResponse(error.getField(), error.getDefaultMessage()))
            .toList();

    return ResponseEntity.badRequest()
        .body(
            error(
                HttpStatus.BAD_REQUEST,
                "Dados de cadastro inválidos.",
                fields));
  }

  @ExceptionHandler(EmailAlreadyRegisteredException.class)
  public ResponseEntity<ApiErrorResponse> handleDuplicateEmail(
      EmailAlreadyRegisteredException exception) {
    return conflict(exception.getMessage());
  }

  @ExceptionHandler(DuplicateKeyException.class)
  public ResponseEntity<ApiErrorResponse> handleDuplicateKey(DuplicateKeyException exception) {
    return conflict("Já existe um usuário cadastrado com este e-mail.");
  }

  @ExceptionHandler(InvalidCatalogRequestException.class)
  public ResponseEntity<ApiErrorResponse> handleInvalidCatalog(InvalidCatalogRequestException exception) {
    return ResponseEntity.badRequest()
        .body(error(HttpStatus.BAD_REQUEST, exception.getMessage(), List.of()));
  }

  @ExceptionHandler(CatalogCardNotFoundException.class)
  public ResponseEntity<ApiErrorResponse> handleMissingCatalogCard(CatalogCardNotFoundException exception) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(error(HttpStatus.NOT_FOUND, exception.getMessage(), List.of()));
  }

  @ExceptionHandler(ExternalApiException.class)
  public ResponseEntity<ApiErrorResponse> handleExternalApi(ExternalApiException exception) {
    HttpStatus status = externalStatus(exception);
    log.warn(
        "Falha ao consultar o catálogo {}: {}",
        exception.getCardGame(),
        exception.getMessage(),
        exception);
    return ResponseEntity.status(status).body(error(status, externalMessage(exception), List.of()));
  }

  private ResponseEntity<ApiErrorResponse> conflict(String message) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(
            error(
                HttpStatus.CONFLICT,
                message,
                List.of(new FieldErrorResponse("email", message))));
  }

  private static HttpStatus externalStatus(ExternalApiException exception) {
    return switch (exception.getErrorType()) {
      case RATE_LIMITED -> HttpStatus.TOO_MANY_REQUESTS;
      case TIMEOUT, UNAVAILABLE, SERVER_ERROR -> HttpStatus.SERVICE_UNAVAILABLE;
      case UNAUTHORIZED, INVALID_RESPONSE -> HttpStatus.BAD_GATEWAY;
    };
  }

  private static String externalMessage(ExternalApiException exception) {
    return switch (exception.getErrorType()) {
      case RATE_LIMITED -> "O catálogo externo limitou as consultas. Tente de novo em instantes.";
      case TIMEOUT -> "O catálogo externo demorou para responder.";
      case UNAVAILABLE -> "O catálogo externo está indisponível.";
      case SERVER_ERROR -> "O catálogo externo falhou ao responder.";
      case UNAUTHORIZED -> "O catálogo externo recusou a credencial configurada.";
      case INVALID_RESPONSE -> "O catálogo externo devolveu uma resposta inválida.";
    };
  }

  private ApiErrorResponse error(HttpStatus status, String message, List<FieldErrorResponse> fields) {
    return new ApiErrorResponse(
        Instant.now(), status.value(), status.getReasonPhrase(), message, fields);
  }
}
