package com.pitcc.model;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;

import static com.pitcc.model.PurchaseFixtures.NOW;
import static org.junit.jupiter.api.Assertions.*;

class AdPurchaseAvailabilityTest {

    private Ad ad(boolean saleEnabled) {
        CollectionItem item = new CollectionItem(
                "seller", "card-pikachu", 5, CardCondition.NEAR_MINT, CardLanguage.PORTUGUESE
        );

        return new Ad(
                "seller",
                item,
                3,
                saleEnabled,
                true,
                saleEnabled ? new BigDecimal("45.00") : null,
                NOW
        );
    }

    @Test
    void pendingPaymentsReduceWhatOtherBuyersCanOrder() {
        Ad ad = ad(true);

        ReflectionTestUtils.setField(ad, "purchaseHolds", List.of(
                new AdPurchaseHold("order-1", 2, NOW)
        ));

        assertEquals(2, ad.heldForPurchase());
        assertEquals(1, ad.availableForPurchase());
    }

    @Test
    void tradeOnlyOrInactiveAdsAreNotAvailableForPurchase() {
        assertEquals(0, ad(false).availableForPurchase());

        Ad cancelled = ad(true);
        ReflectionTestUtils.setField(cancelled, "status", AdStatus.CANCELLED);

        assertEquals(0, cancelled.availableForPurchase());
    }

    @Test
    void legacyDocumentsWithoutHoldsAreFullyAvailable() {
        Ad ad = ad(true);
        ReflectionTestUtils.setField(ad, "purchaseHolds", null);

        assertEquals(0, ad.heldForPurchase());
        assertEquals(3, ad.availableForPurchase());
    }
}
