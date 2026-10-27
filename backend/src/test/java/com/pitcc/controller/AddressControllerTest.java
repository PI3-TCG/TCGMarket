package com.pitcc.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pitcc.dto.AddressRequest;
import com.pitcc.dto.AddressResponse;
import com.pitcc.exception.AddressNotFoundException;
import com.pitcc.exception.GlobalExceptionHandler;
import com.pitcc.model.DeliveryAddress;
import com.pitcc.model.User;
import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import com.pitcc.security.ApiErrorWriter;
import com.pitcc.security.JwtService;
import com.pitcc.security.SecurityConfig;
import com.pitcc.service.AddressService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AddressController.class)
@Import({SecurityConfig.class, JwtService.class, ApiErrorWriter.class, GlobalExceptionHandler.class})
@TestPropertySource(
    properties = {
      "security.jwt.secret=test-secret-key-must-be-at-least-32-bytes!",
      "security.jwt.expiration=1h"
    })
class AddressControllerTest {

  private static final String VALID =
      """
      {"label":"Casa","recipientName":"Ana Souza","zipCode":"13010-000","street":"Rua A",
       "number":"12","withoutNumber":false,"complement":null,"district":"Centro",
       "city":"Campinas","state":"SP","primary":true}
      """;

  @Autowired private MockMvc mockMvc;

  @Autowired private JwtService jwtService;

  @MockitoBean private AddressService addressService;

  @MockitoBean private UserRepository userRepository;

  private String token;

  @BeforeEach
  void authenticate() {
    User user = new User();
    user.setId("u1");
    user.setRole(UserRole.USER);
    when(userRepository.findById("u1")).thenReturn(Optional.of(user));
    token = "Bearer " + jwtService.generate("u1", UserRole.USER);
  }

  private static AddressResponse response() {
    return new AddressResponse(
        "a1", "Casa", "Ana Souza", "13010000", "Rua A", "12", false, null, "Centro", "Campinas", "SP",
        true);
  }

  @Test
  void requiresLogin() throws Exception {
    mockMvc.perform(get("/api/users/me/addresses")).andExpect(status().isUnauthorized());
  }

  @Test
  void listsTheAddressesOfTheAuthenticatedUser() throws Exception {
    when(addressService.list("u1")).thenReturn(List.of(response()));

    mockMvc
        .perform(get("/api/users/me/addresses").header(HttpHeaders.AUTHORIZATION, token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value("a1"))
        .andExpect(jsonPath("$[0].primary").value(true));
  }

  @Test
  void createsAnAddress() throws Exception {
    when(addressService.create(eq("u1"), any(AddressRequest.class))).thenReturn(response());

    mockMvc
        .perform(
            post("/api/users/me/addresses")
                .header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.zipCode").value("13010000"));
  }

  @Test
  void reportsEveryInvalidFieldAtOnce() throws Exception {
    mockMvc
        .perform(
            post("/api/users/me/addresses")
                .header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"recipientName":" ","zipCode":"123","street":"","district":"",
                     "city":"","state":"","withoutNumber":true}
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Revise os dados do endereço."))
        .andExpect(jsonPath("$.fields[?(@.field == 'recipientName')].message")
            .value("Informe o nome do destinatário."))
        .andExpect(jsonPath("$.fields[?(@.field == 'zipCode')].message")
            .value("Informe um CEP com 8 dígitos."));

    verify(addressService, never()).create(anyString(), any());
  }

  @Test
  void reportsTheFieldRejectedByTheDomain() throws Exception {
    when(addressService.create(eq("u1"), any(AddressRequest.class)))
        .thenThrow(new DeliveryAddress.InvalidFieldException("number", "Informe o número ou marque \"Sem número\"."));

    mockMvc
        .perform(
            post("/api/users/me/addresses")
                .header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fields[0].field").value("number"));
  }

  @Test
  void returnsNotFoundForAnotherUsersAddress() throws Exception {
    when(addressService.update(eq("u1"), eq("a9"), any(AddressRequest.class)))
        .thenThrow(new AddressNotFoundException());

    mockMvc
        .perform(
            put("/api/users/me/addresses/a9")
                .header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Endereço não encontrado."));
  }
}
