package com.pitcc.exception;

public class InvalidCredentialsException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  public static final String MESSAGE = "E-mail ou senha inválidos.";

  public InvalidCredentialsException() {
    super(MESSAGE);
  }
}
