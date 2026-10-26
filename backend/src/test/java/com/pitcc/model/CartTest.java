package com.pitcc.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static com.pitcc.model.PurchaseFixtures.NOW;
import static org.junit.jupiter.api.Assertions.*;

class CartTest {

    private final Cart cart = new Cart("buyer", NOW);

    private static BigDecimal price(String value) {
        return new BigDecimal(value);
    }

    @Test
    void addingSameAdAgainAccumulatesInOneLineWithCurrentPrice() {
        cart.addItem("pikachu", "seller-a", 1, price("45.00"), 3, NOW);
        cart.addItem("pikachu", "seller-a", 1, price("50.00"), 3, NOW);

        assertEquals(1, cart.getItems().size());
        assertEquals(2, cart.getItems().getFirst().getQuantity());
        assertEquals(0, price("50.00").compareTo(cart.getItems().getFirst().getAcceptedUnitPrice()));
    }

    @Test
    void acceptsAdsFromDifferentSellers() {
        cart.addItem("pikachu", "seller-a", 2, price("45.00"), 2, NOW);
        cart.addItem("eevee", "seller-b", 1, price("30.00"), 1, NOW);
        cart.addItem("sol-ring", "seller-a", 1, price("25.00"), 4, NOW);

        assertEquals(3, cart.distinctItemCount());
        assertEquals(
                List.of("seller-a", "seller-b", "seller-a"),
                cart.getItems().stream().map(CartItem::getSellerId).toList()
        );
    }

    @Test
    void rejectsQuantityAboveAvailabilityIncludingWhatIsAlreadyInTheCart() {
        cart.addItem("pikachu", "seller-a", 2, price("45.00"), 2, NOW);

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> cart.addItem("pikachu", "seller-a", 1, price("45.00"), 2, NOW)
        );

        assertEquals("Informe uma quantidade entre 1 e 2.", error.getMessage());
        assertEquals(2, cart.getItems().getFirst().getQuantity());
    }

    @Test
    void rejectsOwnAdTradeOnlyAdAndSoldOutAd() {
        assertEquals(
                "Não é possível comprar o próprio anúncio.",
                assertThrows(IllegalArgumentException.class, () ->
                        cart.addItem("own", "buyer", 1, price("10.00"), 1, NOW)
                ).getMessage()
        );

        assertEquals(
                "O anúncio precisa ter preço de venda.",
                assertThrows(IllegalArgumentException.class, () ->
                        cart.addItem("trade-only", "seller-a", 1, null, 1, NOW)
                ).getMessage()
        );

        assertEquals(
                "O anúncio não tem exemplares disponíveis.",
                assertThrows(IllegalArgumentException.class, () ->
                        cart.addItem("sold-out", "seller-a", 1, price("10.00"), 0, NOW)
                ).getMessage()
        );

        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    void selectedSubtotalOnlyCountsSelectedItems() {
        cart.addItem("pikachu", "seller-a", 2, price("45.00"), 2, NOW);
        cart.addItem("eevee", "seller-b", 1, price("30.00"), 1, NOW);
        cart.addItem("sol-ring", "seller-a", 1, price("25.00"), 1, NOW);

        cart.select("eevee", false, NOW);

        BigDecimal selected = cart.selectedItems().stream()
                .map(CartItem::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertEquals(0, price("115.00").compareTo(selected));
        assertEquals(3, cart.distinctItemCount());
    }

    @Test
    void removingPurchasedKeepsRejectedAndUnselectedItems() {
        cart.addItem("pikachu", "seller-a", 2, price("45.00"), 2, NOW);
        cart.addItem("eevee", "seller-b", 1, price("30.00"), 1, NOW);
        cart.addItem("sol-ring", "seller-c", 1, price("25.00"), 1, NOW);

        cart.removePurchased(List.of("pikachu"), NOW);

        assertEquals(
                List.of("eevee", "sol-ring"),
                cart.getItems().stream().map(CartItem::getAdId).toList()
        );
    }

    @Test
    void removingTwiceReportsThatTheItemWasAlreadyGone() {
        cart.addItem("eevee", "seller-b", 1, price("30.00"), 1, NOW);

        assertTrue(cart.removeItem("eevee", NOW));
        assertFalse(cart.removeItem("eevee", NOW));
    }
}
