package com.pitcc.service;

import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "catalog.import.enabled",
        havingValue = "true"
)
public class CatalogImportRunner implements ApplicationRunner {

  private static final Logger log =
          LoggerFactory.getLogger(CatalogImportRunner.class);

  private final ApplicationContext context;
  private final CatalogImportService service;
  private final CatalogLocalizationService localization;
  private final String game;
  private final String query;
  private final String mode;
  private final String pokemonDumpDir;

  public CatalogImportRunner(
          ApplicationContext context,
          CatalogImportService service,
          CatalogLocalizationService localization,
          @Value("${catalog.import.game:}") String game,
          @Value("${catalog.import.query:}") String query,
          @Value("${catalog.import.mode:query}") String mode,
          @Value("${catalog.import.pokemon.dump-dir:}") String pokemonDumpDir) {

    this.context = context;
    this.service = service;
    this.localization = localization;
    this.game = game;
    this.query = query;
    this.mode = mode;
    this.pokemonDumpDir = pokemonDumpDir;
  }

  /** A importação é uma execução avulsa: ao terminar, encerra em vez de seguir servindo HTTP. */
  @Override
  public void run(ApplicationArguments args) {
    execute();
    System.exit(SpringApplication.exit(context, () -> 0));
  }

  private void execute() {
    String selectedMode = mode.trim().toLowerCase(Locale.ROOT);
    if (selectedMode.equals("localize")) {
      CatalogLocalizationReport report = localization.localize(game);
      log.info("LOCALIZE_REPORT source={} language={} fetched={} matched={} modified={} unmatched={}",
              report.source(), report.language(), report.fetched(), report.matched(),
              report.modified(), report.unmatched());
      return;
    }

    CatalogImportReport report =
            switch (selectedMode) {
              case "query" -> service.importByQuery(game, query);
              case "all" -> service.importAll(game);
              case "dump" -> service.importPokemonDump(pokemonDumpDir);
              default -> throw new IllegalArgumentException(
                      "Modo de importação inválido. Use query, all, dump ou localize."
              );
            };

    log.info(
            "IMPORT_REPORT source={} mapped={} persisted={} "
                    + "notAttempted={} aborted={} issues={}",
            report.source(),
            report.mapped(),
            report.persisted(),
            report.notAttempted(),
            report.aborted(),
            report.issues().size()
    );

    report.issues().forEach(issue -> log.warn(
            "IMPORT_ISSUE source={} externalId={} stage={} reason={}",
            issue.source(),
            issue.externalId(),
            issue.stage(),
            issue.message()
    ));

    if (!report.successful()) {
      throw new IllegalStateException(
              "Importação terminou com falhas. "
                      + "Consulte IMPORT_REPORT e IMPORT_ISSUE."
      );
    }
  }
}