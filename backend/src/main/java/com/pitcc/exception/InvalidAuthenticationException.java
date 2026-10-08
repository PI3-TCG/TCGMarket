package com.pitcc.exception;

public class InvalidAuthenticationException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  public static final String MESSAGE = "Autenticação inválida.";

  public InvalidAuthenticationException() {
    super(MESSAGE);
  }
}
