package com.pitcc.exception;

public class UserNotFoundException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  public static final String MESSAGE = "Usuário não encontrado.";

  public UserNotFoundException() {
    super(MESSAGE);
  }
}
