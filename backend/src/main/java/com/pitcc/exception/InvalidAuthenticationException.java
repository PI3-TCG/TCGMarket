package com.pitcc.exception;

public class InvalidAuthenticationException extends RuntimeException {

  public static final String MESSAGE = "Autenticação inválida.";

  public InvalidAuthenticationException() {
    super(MESSAGE);
  }
}
