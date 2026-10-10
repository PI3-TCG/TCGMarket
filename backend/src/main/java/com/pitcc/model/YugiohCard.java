package com.pitcc.model;

import java.util.List;

public class YugiohCard extends Card{

    private Integer atk;
    private Integer def;
    private Integer level;
    private Integer rank;
    private Integer linkRating;
    private YugiohAttribute attribute;
    private String monsterType;
    private YugiohCardType yugiohCardType;
    private List<YugiohInvocation> invocationForms;

    public YugiohCard(String name, String edition, String codeCollection,
                      String cardNumber, String officialRarity, String imageUrl,
                      String externalId, Integer atk, Integer def, Integer level,
                      Integer rank, Integer linkRating, YugiohAttribute attribute,
                      String monsterType, YugiohCardType yugiohCardType, List<YugiohInvocation> invocationForms) {

        super(name, CardGame.YUGIOH,edition,
                codeCollection, cardNumber, officialRarity,
                imageUrl, externalId, CardSource.YGOPRODECK);

        // =======================  VALIDAÇÕES  ========================

        //validação do yugiohCardType
        if (yugiohCardType == null){
            throw new IllegalArgumentException("O tipo de carta Yu-Gi-Oh! é obrigatório!");
        }

        //validação do ATK, DEF e level
        if (atk != null && atk < 0) {
            throw new IllegalArgumentException("O ATK não pode ser negativo.");
        }

        if (def != null && def < 0) {
            throw new IllegalArgumentException("A DEF não pode ser negativa.");
        }

        if (level != null && level <= 0) {
            throw new IllegalArgumentException("O Nível não pode ser negativo.");
        }

        if (yugiohCardType != YugiohCardType.MONSTER
                && (atk != null || def != null || level != null)) {
            throw new IllegalArgumentException("Somente cartas MONSTER podem possuir ATK, DEF ou Level.");
        }

        //validação rank
        if (rank != null && rank <= 0) {
            throw new IllegalArgumentException("O Rank deve ser maior que zero.");
        }

        // Validação do linkRating
        if (linkRating != null && linkRating <= 0) {
            throw new IllegalArgumentException("O Link Rating deve ser maior que zero.");
        }

        //validações do attribute
        if (yugiohCardType == YugiohCardType.MONSTER && attribute == null) {
            throw new IllegalArgumentException("Cartas do tipo MONSTER devem possuir um atributo.");
        }

        if (yugiohCardType != YugiohCardType.MONSTER && attribute != null) {
            throw new IllegalArgumentException("Somente cartas do tipo MONSTER podem ter atributos.");
        }

        //validações do monsterType
        if (yugiohCardType == YugiohCardType.MONSTER && (monsterType == null || monsterType.isBlank()) ) {
            throw new IllegalArgumentException("Cartas do tipo MONSTER devem especificar o tipo de monstro.");
        }

        if (yugiohCardType != YugiohCardType.MONSTER && monsterType != null) {
            throw new IllegalArgumentException("Apenas cartas MONSTER podem possuir tipo de monstro.");
        }

        //validações do invocationForms
        if (yugiohCardType != YugiohCardType.MONSTER
                && invocationForms != null && !invocationForms.isEmpty()) {
            throw new IllegalArgumentException("Somente cartas MONSTER podem possuir formas de invocação.");
        }

        if (invocationForms != null && invocationForms.contains(YugiohInvocation.LINK)
                && (def != null || level != null || rank != null)) {
            throw new IllegalArgumentException("Monstros LINK não podem possuir DEF, Level ou Rank.");
        }

        if (invocationForms != null && invocationForms.contains(YugiohInvocation.LINK)
                && linkRating == null) {
            throw new IllegalArgumentException("Monstros LINK devem possuir Link Rating.");
        }

        if ((invocationForms == null || !invocationForms.contains(YugiohInvocation.LINK))
                && linkRating != null) {
            throw new IllegalArgumentException("Somente monstros LINK podem possuir Link Rating.");
        }

        if (invocationForms != null && invocationForms.contains(YugiohInvocation.XYZ)
                && rank == null) {
            throw new IllegalArgumentException("Monstros XYZ devem possuir Rank.");
        }

        if ((invocationForms == null || !invocationForms.contains(YugiohInvocation.XYZ))
                && rank != null) {
            throw new IllegalArgumentException("Somente monstros XYZ podem possuir Rank.");
        }

        if (invocationForms != null
                && invocationForms.contains(YugiohInvocation.XYZ) && level != null) {
            throw new IllegalArgumentException("Monstros XYZ não podem possuir Level.");
        }

        if (invocationForms != null
                && invocationForms.contains(YugiohInvocation.LINK)
                && invocationForms.contains(YugiohInvocation.XYZ)) {
            throw new IllegalArgumentException("Uma carta não pode ser simultaneamente LINK e XYZ.");
        }

        // =============================================================

        this.atk = atk;
        this.def = def;
        this.level = level;
        this.rank = rank;
        this.linkRating = linkRating;
        this.attribute = attribute;
        this.monsterType = monsterType;
        this.yugiohCardType = yugiohCardType;
        this.invocationForms = invocationForms == null
                ? List.of() //se true
                : List.copyOf(invocationForms); // se false

    }

    //getters
    public Integer getAtk() {
        return atk;
    }

    public Integer getDef() {
        return def;
    }

    public Integer getLevel() {
        return level;
    }

    public Integer getLinkRating() {
        return linkRating;
    }

    public Integer getRank() {
        return rank;
    }

    public YugiohAttribute getAttribute() {
        return attribute;
    }

    public YugiohCardType getYugiohCardType(){
        return yugiohCardType;
    }

    public String getMonsterType() {
        return monsterType;
    }

    public List<YugiohInvocation> getInvocationForms() {
        return invocationForms;
    }
}

