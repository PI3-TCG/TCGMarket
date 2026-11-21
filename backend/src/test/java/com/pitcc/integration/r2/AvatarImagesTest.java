package com.pitcc.integration.r2;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class AvatarImagesTest {
  @Test void acceptsJpegPngAndWebpHeaders() {
    assertEquals("jpg", AvatarImages.extension("image/jpeg"));
    assertEquals("png", AvatarImages.extension("image/png"));
    assertEquals("webp", AvatarImages.extension("image/webp"));
    AvatarImages.checkHeader("image/jpeg", new byte[] {(byte) 255, (byte) 216, (byte) 255});
    AvatarImages.checkHeader("image/png", new byte[] {(byte) 137, 80, 78, 71, 13, 10, 26, 10});
    AvatarImages.checkHeader("image/webp", new byte[] {'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'});
  }

  @Test void rejectsOtherTypesAndOversizedFiles() {
    assertThrows(IllegalArgumentException.class, () -> AvatarImages.extension("image/gif"));
    assertThrows(IllegalArgumentException.class, () -> AvatarImages.checkSize(2L * 1024 * 1024 + 1));
    assertThrows(IllegalArgumentException.class,
        () -> AvatarImages.checkHeader("image/png", new byte[] {(byte) 255, (byte) 216, (byte) 255}));
  }

  @Test void rejectsKeyFromAnotherAccount() {
    R2AvatarStorage.requireOwned("owner", "avatars/owner/photo.jpg");
    assertThrows(IllegalArgumentException.class,
        () -> R2AvatarStorage.requireOwned("owner", "avatars/other/photo.jpg"));
    assertThrows(IllegalArgumentException.class,
        () -> R2AvatarStorage.requireOwned("owner", "avatars/owner/nested/photo.jpg"));
  }
}
