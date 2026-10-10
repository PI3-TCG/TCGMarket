package com.pitcc.service;

import com.pitcc.integration.catalog.*;
import com.pitcc.integration.catalog.pokemon.*;
import com.pitcc.integration.catalog.mtg.*;
import com.pitcc.integration.catalog.yugioh.*;
import com.pitcc.model.*;
import com.pitcc.repository.CardRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.anything;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/** HTTP simulado, clients/providers/mappers reais e MongoDB real do perfil test. */
@SpringBootTest
@ActiveProfiles("test")
class CatalogImportFlowTest {
  @Autowired CardImportService persistence;
  @Autowired CardRepository repository;
  @Autowired CatalogSearchService search;
  private final List<Key> cleanup = new ArrayList<>();
  record Key(CardSource source, String id) {}
  record Endpoint(RestClient client, MockRestServiceServer server) {}

  @AfterEach void cleanup() {
    cleanup.forEach(key -> repository.findBySourceAndExternalId(key.source(), key.id()).ifPresent(repository::delete));
  }

  @Test void shouldImportAllGamesAndPersistTheirSetsAndSourceIdentifiers() {
    String id = UUID.randomUUID().toString();
    var pokemon = endpoint();
    var magic = endpoint();
    var yugioh = endpoint();
    pokemon.server().expect(anything()).andRespond(withSuccess(pokemonJson(id, "Pikachu", "60"), MediaType.APPLICATION_JSON));
    magic.server().expect(anything()).andRespond(withSuccess(magicJson(id), MediaType.APPLICATION_JSON));
    String printing = "89631139:TEST-" + id + ":Common";
    yugioh.server().expect(anything()).andRespond(withSuccess("""
        {"data":[{"id":89631139,"name":"Blue-Eyes White Dragon","type":"Normal Monster",
        "race":"Dragon","attribute":"LIGHT","atk":3000,"def":2500,"level":8,
        "card_sets":[{"set_name":"Test set","set_code":"TEST-%s","set_rarity":"Common"}]}]}
        """.formatted(id), MediaType.APPLICATION_JSON));
    track(CardSource.POKEMON_TCG_API,id); track(CardSource.SCRYFALL,id); track(CardSource.YGOPRODECK,printing);
    var importer = new CatalogImportService(List.of(
        new PokemonTcgProvider(new PokemonTcgClient(pokemon.client())),
        new MtgProvider(new MtgClient(magic.client())),
        new YugiohProvider(new YugiohClient(yugioh.client()))), persistence);
    assertTrue(importer.importByQuery("pokemon", "Pikachu").successful());
    assertTrue(importer.importByQuery("magic", "Black Lotus").successful());
    assertTrue(importer.importByQuery("yugioh", "Blue-Eyes").successful());
    Card p = repository.findBySourceAndExternalId(CardSource.POKEMON_TCG_API,id).orElseThrow();
    Card m = repository.findBySourceAndExternalId(CardSource.SCRYFALL,id).orElseThrow();
    Card y = repository.findBySourceAndExternalId(CardSource.YGOPRODECK,printing).orElseThrow();
    assertEquals(60, assertInstanceOf(PokemonCard.class,p).getHp());
    assertEquals(CardGame.POKEMON,p.getGame());
    assertEquals("Base Set",p.getEdition());
    assertEquals("base1",p.getCodeCollection());
    assertEquals("oracle-"+id,m.getConceptualId());
    assertInstanceOf(MagicCard.class,m);
    assertEquals("lea",m.getCodeCollection());
    assertEquals(CardGame.MAGIC_THE_GATHERING,m.getGame());
    assertEquals("Limited Edition Alpha",m.getEdition());
    assertEquals(3000,assertInstanceOf(YugiohCard.class,y).getAtk());
    assertEquals("89631139",y.getConceptualId());
    assertEquals(CardGame.YUGIOH,y.getGame());
    assertEquals("Test set",y.getEdition());
    assertEquals("TEST-"+id,y.getCodeCollection());
    // Mesmo externalId, fontes diferentes: duas identidades independentes.
    assertNotEquals(p.getId(),m.getId());
    assertEquals(1,repository.countBySourceAndExternalId(CardSource.POKEMON_TCG_API,id));
    assertEquals(1,repository.countBySourceAndExternalId(CardSource.SCRYFALL,id));
    // Consulta interna funciona sem novas expectativas HTTP.
    assertEquals("Pikachu",search.findByExternalId("pokemon",id).name());
    assertEquals("oracle-"+id,search.findByExternalId("magic",id).conceptualId());
    pokemon.server().verify(); magic.server().verify(); yugioh.server().verify();
  }

  @Test void shouldUpdateWithoutChangingIdAndRejectAnInvalidReplacement() {
    String id=UUID.randomUUID().toString(); track(CardSource.POKEMON_TCG_API,id);
    var endpoint=endpoint();
    endpoint.server().expect(anything()).andRespond(withSuccess(pokemonJson(id,"Pikachu","60"),MediaType.APPLICATION_JSON));
    endpoint.server().expect(anything()).andRespond(withSuccess(pokemonJson(id,"Pikachu atualizado","90"),MediaType.APPLICATION_JSON));
    endpoint.server().expect(anything()).andRespond(withSuccess(pokemonJson(id,"Pikachu atualizado","90"),MediaType.APPLICATION_JSON));
    endpoint.server().expect(anything()).andRespond(withSuccess(pokemonJson(id,"Inválido","oops"),MediaType.APPLICATION_JSON));
    var importer=importer(endpoint);
    assertTrue(importer.importByQuery("pokemon","Pikachu").successful());
    String originalId=repository.findBySourceAndExternalId(CardSource.POKEMON_TCG_API,id).orElseThrow().getId();
    assertTrue(importer.importByQuery("pokemon","Pikachu").successful());
    assertTrue(importer.importByQuery("pokemon","Pikachu").successful());
    var rejected=importer.importByQuery("pokemon","Pikachu");
    assertFalse(rejected.successful());
    assertEquals(id,rejected.issues().getFirst().externalId());
    Card updated=repository.findBySourceAndExternalId(CardSource.POKEMON_TCG_API,id).orElseThrow();
    assertEquals(originalId,updated.getId());
    assertEquals("Pikachu atualizado",updated.getName());
    assertEquals(90,assertInstanceOf(PokemonCard.class,updated).getHp());
    assertEquals(1,repository.countBySourceAndExternalId(CardSource.POKEMON_TCG_API,id));
    // Também aceita uma entidade que já tem ID, sem alterá-la.
    assertEquals(originalId,persistence.upsert(updated).getId());
    assertEquals(originalId,updated.getId());
    endpoint.server().verify();
  }

  @Test void shouldReportInvalidRowsAndStillPersistTheFollowingValidRow() {
    String bad=UUID.randomUUID().toString(), good=UUID.randomUUID().toString();
    track(CardSource.POKEMON_TCG_API,bad);track(CardSource.POKEMON_TCG_API,good);
    var endpoint=endpoint();
    String json="{\"data\":["+pokemonRow(bad,"Bad","invalid")+","+pokemonRow(good,"Good","60")+"]}";
    endpoint.server().expect(anything()).andRespond(withSuccess(json,MediaType.APPLICATION_JSON));
    var report=importer(endpoint).importByQuery("pokemon","test");
    assertEquals(1,report.persisted());
    assertEquals(1,report.issues().size());
    assertEquals(bad,report.issues().getFirst().externalId());
    assertFalse(repository.existsBySourceAndExternalId(CardSource.POKEMON_TCG_API,bad));
    assertTrue(repository.existsBySourceAndExternalId(CardSource.POKEMON_TCG_API,good));
    endpoint.server().verify();
  }

  @Test void shouldEnforceTheCompoundUniqueIndex() {
    String id=UUID.randomUUID().toString();track(CardSource.POKEMON_TCG_API,id);
    persistence.upsert(pokemon(id));
    assertThrows(DuplicateKeyException.class,()->repository.save(pokemon(id)));
  }

  @Test void shouldKeepOneIdentityUnderConcurrentUpserts() throws Exception {
    String id=UUID.randomUUID().toString();track(CardSource.POKEMON_TCG_API,id);
    var start = new java.util.concurrent.CountDownLatch(1);
    try (var pool = java.util.concurrent.Executors.newFixedThreadPool(4)) {
      List<java.util.concurrent.Future<Card>> futures = new ArrayList<>();
      for (int i=0;i<4;i++) {
        futures.add(pool.submit(() -> { start.await(); return persistence.upsert(pokemon(id)); }));
      }
      start.countDown();
      String persistedId = null;
      for (var future : futures) {
        Card card=future.get(30,java.util.concurrent.TimeUnit.SECONDS);
        if (persistedId == null) persistedId=card.getId();
        assertEquals(persistedId,card.getId());
      }
    }
    assertEquals(1,repository.countBySourceAndExternalId(CardSource.POKEMON_TCG_API,id));
  }

  private CatalogImportService importer(Endpoint e) {
    return new CatalogImportService(List.of(new PokemonTcgProvider(new PokemonTcgClient(e.client()))),persistence);
  }
  private void track(CardSource source,String id) { cleanup.add(new Key(source,id)); }
  private Endpoint endpoint() {
    RestClient.Builder builder=RestClient.builder().baseUrl("http://catalog.test");
    MockRestServiceServer server=MockRestServiceServer.bindTo(builder).build();
    return new Endpoint(builder.build(),server);
  }
  private PokemonCard pokemon(String id) {
    return new PokemonCard("Pikachu","Base","base1","25","Common",null,id,60,
        PokemonCardType.POKEMON,List.of(PokemonEnergyType.LIGHTNING),null,1,List.of());
  }
  private String pokemonJson(String id,String name,String hp) {
    return "{\"data\":["+pokemonRow(id,name,hp)+"]}";
  }
  private String pokemonRow(String id,String name,String hp) {
    return """
        {"id":"%s","name":"%s","hp":"%s","supertype":"Pokémon","subtypes":["Basic"],
        "types":["Lightning"],"number":"25","rarity":"Common",
        "set":{"id":"base1","name":"Base Set"}}
        """.formatted(id,name,hp);
  }
  private String magicJson(String id) {
    return """
        {"data":[{"id":"%s","oracle_id":"oracle-%s","name":"Black Lotus",
        "set":"lea","set_name":"Limited Edition Alpha","collector_number":"232",
        "rarity":"rare","mana_cost":"{0}","cmc":0,"colors":[],"type_line":"Artifact"}]}
        """.formatted(id,id);
  }
}
