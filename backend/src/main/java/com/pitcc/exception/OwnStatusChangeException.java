package com.pitcc.exception;

public class OwnStatusChangeException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  public static final String MESSAGE = "Você não pode suspender ou reativar a própria conta.";

  public OwnStatusChangeException() {
    super(MESSAGE);
  }
}
