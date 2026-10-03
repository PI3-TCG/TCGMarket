package com.pitcc.exception;

import com.pitcc.dto.ApiErrorResponse;
import com.pitcc.dto.ApiErrorResponse.FieldErrorResponse;
import java.time.Instant;
import java.util.List;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

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

  private ResponseEntity<ApiErrorResponse> conflict(String message) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(
            error(
                HttpStatus.CONFLICT,
                message,
                List.of(new FieldErrorResponse("email", message))));
  }

  private ApiErrorResponse error(HttpStatus status, String message, List<FieldErrorResponse> fields) {
    return new ApiErrorResponse(
        Instant.now(), status.value(), status.getReasonPhrase(), message, fields);
  }
}
