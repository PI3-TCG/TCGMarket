package com.pitcc.model;

import java.util.List;

public class PokemonAttack {

    private final String name;
    private final List<PokemonEnergyType> energyCost;
    private final String damage;

    public PokemonAttack (String name, List<PokemonEnergyType> energyCost, String damage) {
        if (name == null || name.isBlank()){
            throw new IllegalArgumentException( " O Nome do ataque é obrigatório.");
        }

        this.name = name.strip();
        this.energyCost = energyCost == null
                ? List.of()
                : List.copyOf(energyCost);
        this.damage = damage;
    }

    public String getName() {
        return name;
    }

    public List<PokemonEnergyType> getEnergyCost() {
        return energyCost;
    }

    public String getDamage() {
        return damage;
    }
}