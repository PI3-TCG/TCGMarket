package com.pitcc.integration.r2;

/** Usado quando as variáveis do R2 não estão no ambiente. O perfil continua funcionando, sem foto nova. */
public class DisabledAvatarStorage implements AvatarStorage {
  private static final String UNAVAILABLE = "O armazenamento de fotos não está configurado.";

  @Override
  public Ticket prepare(String userId, String contentType, long contentLength) {
    throw new IllegalArgumentException(UNAVAILABLE);
  }

  @Override
  public void verify(String userId, String key) {
    throw new IllegalArgumentException(UNAVAILABLE);
  }

  @Override
  public void delete(String key) {}

  @Override
  public String readUrl(String key) {
    return null;
  }
}
