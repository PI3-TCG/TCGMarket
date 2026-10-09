package com.pitcc.exception;

public class OwnRoleChangeException extends RuntimeException {

  public static final String MESSAGE = "Você não pode alterar o próprio perfil.";

  public OwnRoleChangeException() {
    super(MESSAGE);
  }
}
