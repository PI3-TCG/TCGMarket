package com.pitcc.integration.catalog.pokemon;

import com.pitcc.integration.catalog.pokemon.dto.PokemonCardDto;
import com.pitcc.integration.catalog.pokemon.dto.PokemonSetDto;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

/**
 * Lê o dump oficial do repositório PokemonTCG/pokemon-tcg-data, que tem os
 * mesmos dados da Pokémon TCG API. As cartas ficam em cards/en/{setId}.json,
 * sem o objeto set, que vem de sets/en.json.
 */
public final class PokemonDumpReader {

  private static final String JSON = ".json";

  private final ObjectMapper mapper = JsonMapper.builder().build();
  private final Path cardsDir;
  private final Map<String, String> setNames;

  public PokemonDumpReader(Path root) {
    this.cardsDir = root.resolve("cards").resolve("en");
    Path setsFile = root.resolve("sets").resolve("en.json");
    if (!Files.isDirectory(cardsDir) || !Files.isRegularFile(setsFile)) {
      throw new IllegalArgumentException(
              "Dump Pokémon inválido: esperado cards/en/ e sets/en.json em " + root);
    }
    this.setNames = mapper.readValue(setsFile.toFile(), new TypeReference<List<PokemonSetDto>>() {})
            .stream()
            .collect(Collectors.toUnmodifiableMap(PokemonSetDto::id, PokemonSetDto::name));
  }

  public List<String> setIds() {
    try (Stream<Path> files = Files.list(cardsDir)) {
      return files
              .map(file -> file.getFileName().toString())
              .filter(name -> name.endsWith(JSON))
              .map(name -> name.substring(0, name.length() - JSON.length()))
              .sorted()
              .toList();
    } catch (IOException exception) {
      throw new UncheckedIOException(exception);
    }
  }

  public List<PokemonCardDto> readSet(String setId) {
    PokemonSetDto set = new PokemonSetDto(setId, setNames.getOrDefault(setId, setId));
    List<PokemonCardDto> cards = mapper.readValue(
            cardsDir.resolve(setId + JSON).toFile(),
            new TypeReference<List<PokemonCardDto>>() {});
    return cards.stream()
            .map(card -> card == null ? null : withSet(card, set))
            .toList();
  }

  private static PokemonCardDto withSet(PokemonCardDto card, PokemonSetDto set) {
    return new PokemonCardDto(
            card.id(),
            card.name(),
            card.hp(),
            card.convertedRetreatCost(),
            card.supertype(),
            card.subtypes(),
            card.number(),
            card.rarity(),
            set,
            card.images(),
            card.types(),
            card.attacks()
    );
  }
}
