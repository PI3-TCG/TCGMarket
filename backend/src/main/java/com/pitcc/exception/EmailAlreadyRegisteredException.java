package com.pitcc.exception;

public class EmailAlreadyRegisteredException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  public EmailAlreadyRegisteredException(String email) {
    super("Já existe um usuário cadastrado com o e-mail " + email + ".");
  }
}
