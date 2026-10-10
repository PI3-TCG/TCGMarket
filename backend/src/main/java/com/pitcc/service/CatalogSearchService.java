package com.pitcc.service;

import com.pitcc.dto.CatalogCardResponse;
import com.pitcc.exception.CatalogCardNotFoundException;
import com.pitcc.exception.InvalidCatalogRequestException;
import com.pitcc.model.CardGame;
import com.pitcc.repository.CardRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CatalogSearchService {
  private final CardRepository repository;

  public CatalogSearchService(CardRepository repository) {
    this.repository = repository;
  }

  public List<CatalogCardResponse> search(String game, String query) {
    if (query == null || query.isBlank()) {
      throw new InvalidCatalogRequestException("Informe o nome da carta no parâmetro q.");
    }
    CardGame selected = CatalogGameResolver.parse(game);
    return repository.findTop50ByGameAndNameContainingIgnoreCaseOrderByNameAscIdAsc(selected, query.trim())
        .stream().map(CatalogCardResponse::from).toList();
  }

  public CatalogCardResponse findByExternalId(String game, String externalId) {
    if (externalId == null || externalId.isBlank()) {
      throw new InvalidCatalogRequestException("Informe o externalId.");
    }
    CardGame selected = CatalogGameResolver.parse(game);
    return repository.findBySourceAndExternalId(CatalogGameResolver.source(selected), externalId.trim())
        .map(CatalogCardResponse::from).orElseThrow(CatalogCardNotFoundException::new);
  }
}
