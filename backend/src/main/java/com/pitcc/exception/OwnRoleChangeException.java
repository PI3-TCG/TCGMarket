package com.pitcc.exception;

public class OwnRoleChangeException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  public static final String MESSAGE = "Você não pode alterar o próprio perfil.";

  public OwnRoleChangeException() {
    super(MESSAGE);
  }
}
