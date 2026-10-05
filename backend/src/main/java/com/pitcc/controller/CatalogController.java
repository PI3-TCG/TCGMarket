package com.pitcc.controller;

import com.pitcc.dto.CatalogCardResponse;
import com.pitcc.service.CatalogSearchService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

  private final CatalogSearchService catalogSearchService;

  public CatalogController(CatalogSearchService catalogSearchService) {
    this.catalogSearchService = catalogSearchService;
  }

  @GetMapping("/{game}/cards")
  public List<CatalogCardResponse> search(@PathVariable String game, @RequestParam("q") String query) {
    return catalogSearchService.search(game, query);
  }

  @GetMapping("/{game}/cards/by-external-id")
  public CatalogCardResponse findByExternalId(
      @PathVariable String game, @RequestParam String externalId) {
    return catalogSearchService.findByExternalId(game, externalId);
  }
}
