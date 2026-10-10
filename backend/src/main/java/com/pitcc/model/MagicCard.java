package com.pitcc.model;

import com.pitcc.util.TextNormalizer;

import java.util.List;

public class MagicCard extends Card {

    private String manaCost;
    private Double cmc;
    private List<MagicColor> color;
    private List<MagicCardType> cardTypes;
    private String strength;
    private String resistance;
    private List<String> superTypes;
    private List<String> subTypes;
    private String rulesText;

    public MagicCard(String name, String edition, String codeCollection,
                     String cardNumber, String officialRarity, String imageUrl,
                     String externalId, String manaCost, Double cmc, List<MagicColor> color,
                     List<MagicCardType> cardTypes, String strength, String resistance,
                     List<String> superTypes, List<String> subTypes, String rulesText){

        super(name, CardGame.MAGIC_THE_GATHERING,edition,
                codeCollection, cardNumber, officialRarity,
                imageUrl, externalId, CardSource.SCRYFALL);

        // =======================  VALIDAÇÕES  ========================

        //validação do cardType
        if (cardTypes == null || cardTypes.isEmpty()) {
            throw new IllegalArgumentException("O tipo de carta Magic deve ser informado obrigatoriamente.");
        }

        //validação cmc
        if (cmc != null && (!Double.isFinite(cmc) || cmc < 0)) { //verifica se o número é finito, ou seja, se não é NaN nem infinito
            throw new IllegalArgumentException("O valor de mana deve ser um número finito e não negativo.");
        }

        // =============================================================

        this.manaCost = manaCost == null
                ? null
                : manaCost.strip(); //remove os espaços em branco do início e do fim da String
        this.cmc = cmc;
        this.color = color == null
                ? List.of()
                : List.copyOf(color);
        this.cardTypes = List.copyOf(cardTypes);
        this.strength = strength;
        this.resistance = resistance;
        this.superTypes = superTypes == null
                ? List.of()
                : List.copyOf(superTypes);
        this.subTypes = subTypes == null
                ? List.of()
                : List.copyOf(subTypes);
        this.rulesText = TextNormalizer.normalizeOptionalText(rulesText);

    }

    //getters
    public String getManaCost() {
        return manaCost;
    }

    public Double getCmc() {
        return cmc;
    }

    public List<MagicColor> getColor() {
        return color;
    }

    public List<MagicCardType> getCardTypes() {
        return cardTypes;
    }

    public String getStrength() {
        return strength;
    }

    public String getResistance() {
        return resistance;
    }

    public List<String> getSuperTypes() {
        return superTypes;
    }

    public List<String> getSubTypes() {
        return subTypes;
    }

    public String getRulesText() {
        return rulesText;
    }
}
