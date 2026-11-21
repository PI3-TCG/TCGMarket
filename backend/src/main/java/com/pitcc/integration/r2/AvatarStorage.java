package com.pitcc.integration.r2;

public interface AvatarStorage {
  record Ticket(String uploadUrl, String key) {}

  Ticket prepare(String userId, String contentType, long contentLength);

  void verify(String userId, String key);

  void delete(String key);

  String readUrl(String key);
}
