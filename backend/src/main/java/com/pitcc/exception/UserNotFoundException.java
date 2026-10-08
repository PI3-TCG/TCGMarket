package com.pitcc.exception;

public class UserNotFoundException extends RuntimeException {

  public static final String MESSAGE = "Usuário não encontrado.";

  public UserNotFoundException() {
    super(MESSAGE);
  }
}
