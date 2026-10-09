import { useEffect, useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { CardDetailsModal } from "@/components/catalog/CardDetailsModal";
import { mockCatalogCards } from "@/mocks/catalogCards";
import type { CatalogCard as CatalogCardData } from "@/types/Catalog";

const PAGE_SIZE = 10;
const gameNames: Record<string, string> = {
  pokemon: "Pokémon",
  magic: "Magic: The Gathering",
  yugioh: "Yu-Gi-Oh!",
  "one-piece": "One Piece",
  digimon: "Digimon",
};

export function CatalogPage() {
  const { game } = useParams({ from: "/catalogo/$game" });
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<CatalogCardData | null>(
    null,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Prévia: substitua este conjunto pelo estado da API quando o backend estiver pronto.
  const cards = useMemo(
    () => mockCatalogCards.filter((card) => card.game === game),
    [game],
  );
  const rarities = useMemo(
    () => [...new Set(cards.map((card) => card.officialRarity))].sort(),
    [cards],
  );

  const filtered = useMemo(() => {
    const result = cards.filter(
      (card) =>
        card.name
          .toLocaleLowerCase("pt-BR")
          .includes(search.trim().toLocaleLowerCase("pt-BR")) &&
        (rarity === "all" || card.officialRarity === rarity),
    );
    result.sort((a, b) =>
      sort === "name-desc"
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name),
    );
    return result;
  }, [cards, search, rarity, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleCards = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [game, search, rarity, sort]);
  useEffect(() => {
    setSearch("");
    setRarity("all");
    setSelectedCard(null);
  }, [game]);

  return (
    <main className="min-h-screen bg-[#FAFBFE] pb-16 text-neutral-900">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {Object.entries(gameNames).map(([slug, label]) => (
            <span
              key={slug}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${slug === game ? "bg-primary-900 text-white" : "bg-neutral-100 text-neutral-600"}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-7 sm:px-6">
        <header className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 via-[#4c075c] to-[#1c205c] px-7 py-10 text-white shadow-lg sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border-[36px] border-white/10" />
          <div className="pointer-events-none absolute bottom-[-130px] right-[20%] size-64 rounded-full bg-secondary-500/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-white/70">
              TCG Market · Catálogo oficial
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Explore o universo {gameNames[game] ?? game}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              Descubra cartas, encontre suas favoritas e explore diferentes
              edições em um só lugar.
            </p>
          </div>
        </header>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-900">
              Explorar coleção
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">
              Catálogo de cartas
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {filtered.length}{" "}
              {filtered.length === 1
                ? "carta encontrada"
                : "cartas encontradas"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="rounded-control border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold lg:hidden"
          >
            {filtersOpen ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside
            className={`${filtersOpen ? "block" : "hidden"} rounded-surface border border-neutral-200 bg-white p-5 shadow-sm lg:block`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Filtros</h3>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRarity("all");
                }}
                className="cursor-pointer text-xs font-semibold text-primary-900 hover:underline"
              >
                Limpar
              </button>
            </div>
            <label
              htmlFor="catalog-search"
              className="mb-2 block text-xs font-bold text-neutral-700"
            >
              Buscar carta
            </label>
            <input
              id="catalog-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome da carta..."
              className="mb-6 w-full rounded-control border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100"
            />
            <label
              htmlFor="catalog-rarity"
              className="mb-2 block text-xs font-bold text-neutral-700"
            >
              Raridade
            </label>
            <select
              id="catalog-rarity"
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
              className="w-full rounded-control border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100"
            >
              <option value="all">Todas as raridades</option>
              {rarities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className="mt-7 rounded-xl bg-primary-100 p-4">
              <p className="text-sm font-bold text-primary-900">
                Sua próxima descoberta começa aqui
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                Explore o catálogo e selecione uma carta para conhecer seus
                detalhes.
              </p>
            </div>
          </aside>

          <section className="min-w-0" aria-label="Resultados do catálogo">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-surface border border-neutral-200 bg-white px-4 py-3">
              <span className="text-sm text-neutral-600">
                <strong className="text-neutral-900">{filtered.length}</strong>{" "}
                resultados
              </span>
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                Ordenar por
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-control border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                >
                  <option value="name-asc">Nome: A–Z</option>
                  <option value="name-desc">Nome: Z–A</option>
                </select>
              </label>
            </div>

            {visibleCards.length === 0 ? (
              <div className="rounded-surface border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
                <div className="mb-4 text-4xl">✦</div>
                <h3 className="font-display text-xl font-bold">
                  Nenhuma carta encontrada
                </h3>
                <p className="mt-2 text-sm text-neutral-500">
                  Tente alterar os filtros ou escolha outro jogo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setRarity("all");
                  }}
                  className="mt-5 cursor-pointer rounded-control bg-primary-900 px-5 py-2.5 text-sm font-bold text-white"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
                {visibleCards.map((card) => (
                  <CatalogCard
                    key={card.id}
                    card={card}
                    onSelect={setSelectedCard}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav
                aria-label="Paginação do catálogo"
                className="mt-8 flex flex-wrap items-center justify-center gap-2"
              >
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-control border border-neutral-200 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((number) => (
                  <button
                    key={number}
                    type="button"
                    aria-current={number === currentPage ? "page" : undefined}
                    onClick={() => setPage(number)}
                    className={`size-9 rounded-control text-sm font-semibold ${number === currentPage ? "bg-primary-900 text-white" : "border border-neutral-200 bg-white text-neutral-700"}`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-control border border-neutral-200 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                </button>
              </nav>
            )}
          </section>
        </div>
      </div>
      <CardDetailsModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </main>
  );
}
