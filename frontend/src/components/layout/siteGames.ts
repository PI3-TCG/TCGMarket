/** Jogos disponíveis no catálogo. Outros TCGs não devem aparecer como destinos navegáveis. */
export const GAMES = [
  {
    name: 'Pokémon',
    from: '#f59e0b',
    to: '#b45309',
    mark: 'poke',
    slug: 'pokemon',
  },
  {
    name: 'Magic',
    from: '#1e3a5f',
    to: '#0f172a',
    mark: 'magic',
    slug: 'magic',
  },
  {
    name: 'Yu-Gi-Oh!',
    from: '#7c2d12',
    to: '#3b0764',
    mark: 'yugioh',
    slug: 'yugioh',
  },
] as const
