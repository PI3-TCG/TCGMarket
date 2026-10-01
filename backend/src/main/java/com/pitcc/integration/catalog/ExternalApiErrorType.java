package com.pitcc.integration.catalog;

public enum ExternalApiErrorType {
  UNAVAILABLE,
  TIMEOUT,
  INVALID_RESPONSE,
  RATE_LIMITED,
  UNAUTHORIZED,
  SERVER_ERROR
}
