package com.pitcc.model;
import java.util.List;


public class PokemonCard extends Card {

    private Integer hp;
    private PokemonCardType pokemonCardType;
    private List<PokemonEnergyType> energyTypes;
    private PokemonEvolutionStage evolutionStage;
    private Integer recoilCost;
    private List<PokemonAttack> attacks;

    public PokemonCard(String name, String edition, String codeCollection,
                       String cardNumber, String officialRarity, String imageUrl,
                       String externalId, Integer hp, PokemonCardType pokemonCardType,
                       List<PokemonEnergyType> energyTypes, PokemonEvolutionStage evolutionStage,
                       Integer recoilCost, List<PokemonAttack> attacks) {

        super(name, CardGame.POKEMON,edition,
                codeCollection, cardNumber, officialRarity,
                imageUrl, externalId, CardSource.POKEMON_TCG_API);


        // =======================  VALIDAÇÕES  ========================

        //validação do pokemonCardType
        if (pokemonCardType == null) {
            throw new IllegalArgumentException("O tipo da carta Pokémon é obrigatório.");
        }

        //validações do HP
        if (pokemonCardType != PokemonCardType.POKEMON && hp != null){
            throw new IllegalArgumentException( "Apenas cartas do tipo POKEMON podem possuir HP.");
        }

        if (pokemonCardType == PokemonCardType.POKEMON && hp == null) {
            throw new IllegalArgumentException( "Um carta do tipo Pokémon deve possuir HP.");
        }

        if (hp != null && hp <= 0) {
            throw new IllegalArgumentException( " O HP deve ser maior que 0 (zero).");
        }

        //validação do recoilCost
        if (recoilCost != null && recoilCost < 0) {
            throw new IllegalArgumentException("O custo do recuo não pode ser negativo.");
        }

        if (pokemonCardType != PokemonCardType.POKEMON && recoilCost != null) {
            throw new IllegalArgumentException(
                    "Somente cartas do tipo Pokémon podem ter custo de recuo."
            );
        }

        //validação evolutionStage
        if (pokemonCardType != PokemonCardType.POKEMON && evolutionStage != null) {
            throw new IllegalArgumentException("Apenas cartas do tipo Pokémon podem possuir estágio de evolução.");
        }

        //validação do energyType
        if (pokemonCardType == PokemonCardType.TRAINER
                && energyTypes != null
                && !energyTypes.isEmpty()) {
            throw new IllegalArgumentException("Cartas do tipo TRAINER não podem possuir tipos de energia.");
        }

        if ( pokemonCardType == PokemonCardType.POKEMON
                && (energyTypes == null || energyTypes.isEmpty()) ) {
            throw new IllegalArgumentException("Cartas do tipo POKEMON devem possuir pelo menos um tipo.");
        }

        // =============================================================

        this.hp = hp;
        this.pokemonCardType = pokemonCardType;
        this.evolutionStage = evolutionStage;
        this.recoilCost = recoilCost;
        this.energyTypes = energyTypes == null
                ? List.of() // se true
                : List.copyOf(energyTypes); // se false
        this.attacks = attacks == null
                ? List.of() //se true
                : List.copyOf(attacks);  // se false

    }

    //getters
    public Integer getHp() {
        return hp;
    }

    public PokemonCardType getPokemonCardType() {
        return pokemonCardType;
    }

    public List<PokemonEnergyType> getEnergyTypes() {
        return energyTypes;
    }

    public PokemonEvolutionStage getEvolutionStage() {
        return evolutionStage;
    }

    public Integer getRecoilCost() {
        return recoilCost;
    }

    public List<PokemonAttack> getAttacks() {
        return attacks;
    }
}
