package com.pitcc.exception;

public class InvalidCredentialsException extends RuntimeException {

  public static final String MESSAGE = "E-mail ou senha inválidos.";

  public InvalidCredentialsException() {
    super(MESSAGE);
  }
}
