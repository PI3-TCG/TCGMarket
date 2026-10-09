package com.pitcc.security;

import com.pitcc.model.UserRole;
import com.pitcc.repository.UserRepository;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

  private final UserRepository userRepository;
  private final String adminEmail;

  public AdminBootstrap(
      UserRepository userRepository, @Value("${security.admin.email:}") String adminEmail) {
    this.userRepository = userRepository;
    this.adminEmail = adminEmail;
  }

  @Override
  public void run(ApplicationArguments args) {
    if (adminEmail == null || adminEmail.isBlank()) {
      return;
    }
    String email = adminEmail.trim().toLowerCase(Locale.ROOT);
    userRepository
        .findByEmail(email)
        .ifPresentOrElse(
            user -> {
              if (user.getRole() == UserRole.ADMIN) {
                return;
              }
              user.setRole(UserRole.ADMIN);
              userRepository.save(user);
              log.info("Usuário {} promovido a ADMIN pela variável ADMIN_EMAIL.", email);
            },
            () ->
                log.warn(
                    "ADMIN_EMAIL aponta para {}, mas nenhuma conta usa esse e-mail. Cadastre a conta e reinicie a aplicação.",
                    email));
  }
}
