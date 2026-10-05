package com.pitcc.exception;

public class CatalogCardNotFoundException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  public CatalogCardNotFoundException() {
    super("Nenhuma carta encontrada para esse identificador.");
  }
}
