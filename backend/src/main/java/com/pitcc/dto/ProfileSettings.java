package com.pitcc.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfileSettings(
    boolean collectionPublic,
    @Size(max = 2800000, message = "A foto deve ter até 2 MB.")
    @Pattern(regexp = "^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$", message = "Envie uma imagem JPEG, PNG ou WebP.")
    String avatarUrl) {}
