package com.pitcc.exception;

public class AccountSuspendedException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  public static final String MESSAGE = "Esta conta está suspensa.";

  public AccountSuspendedException() {
    super(MESSAGE);
  }
}
