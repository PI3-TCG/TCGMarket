package com.pitcc.exception;

public class InvalidCatalogRequestException extends RuntimeException {

  private static final long serialVersionUID = 1L;

  public InvalidCatalogRequestException(String message) {
    super(message);
  }
}
