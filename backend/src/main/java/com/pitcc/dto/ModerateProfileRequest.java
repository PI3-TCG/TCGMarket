package com.pitcc.dto;

import com.pitcc.model.ModeratedProfileField;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ModerateProfileRequest(
    @NotEmpty(message = "Selecione ao menos um campo.") List<ModeratedProfileField> fields,
    @NotBlank(message = "O motivo é obrigatório.")
        @Size(min = 10, max = 300, message = "O motivo deve ter entre 10 e 300 caracteres.")
        String reason) {

  public ModerateProfileRequest {
    reason = reason == null ? null : reason.strip();
    fields = fields == null ? null : fields.stream().distinct().toList();
  }
}
