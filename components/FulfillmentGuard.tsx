'use client';

import { useEffect, useState } from 'react';
import { useFulfillmentStore } from '@/app/store/fulfillmentStore';

/**
 * FulfillmentGuard — mounts in RootLayout.
 * On first load, checks if fulfillment is established.
 * If not, opens the FulfillmentModal automatically.
 * Also handles re-validating persisted delivery state on page refresh.
 */
export default function FulfillmentGuard() {
  const {
    orderType,
    address,
    coordinates,
    isEligible,
    isModalOpen,
    openModal,
    setPickup,
    setDelivery,
    setDistanceResult,
  } = useFulfillmentStore();

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand to load from localStorage
    useFulfillmentStore.persist.onFinishHydration(() => setHasHydrated(true));
    setHasHydrated(useFulfillmentStore.persist.hasHydrated());
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    // Already selected pickup — nothing to do
    if (orderType === 'pickup') return;

    // Has a saved delivery address from localStorage — re-validate distance
    if (orderType === 'delivery' && address && coordinates) {
      // Re-calculate distance and fee silently in the background
      const revalidate = async () => {
        try {
          const distRes = await fetch(`/api/distance?lng=${coordinates.lng}&lat=${coordinates.lat}`);
          if (!distRes.ok) throw new Error('distance failed');
          const { distanceMiles } = await distRes.json();

          const feeRes = await fetch(`/api/delivery-fee?miles=${distanceMiles}`);
          if (!feeRes.ok) throw new Error('fee failed');
          const { feeCents, eligible } = await feeRes.json();

          setDistanceResult(distanceMiles, feeCents, eligible);

          // If previously eligible but now outside radius (edge case), open modal
          if (!eligible && !isModalOpen) {
            openModal();
          }
        } catch {
          // Silently fail — user can still browse, will catch at checkout
        }
      };
      revalidate();
      return;
    }

    // No fulfillment set — open the modal
    if (!isModalOpen) {
      openModal();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]); // Run once after hydration

  return null; // No UI — this is a logic-only component
}
