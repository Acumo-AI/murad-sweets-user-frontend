import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderType = 'pickup' | 'delivery';

export interface FulfillmentState {
  // Core state — persisted
  orderType: OrderType | null;
  address: string | null;       // Formatted display address
  coordinates: { lat: number; lng: number } | null;

  // Computed state — NOT persisted (always recalculated)
  drivingDistanceMiles: number | null;
  deliveryFeeCents: number | null;
  isEligible: boolean | null;

  // UI
  isModalOpen: boolean;

  // Actions
  setPickup: () => void;
  setDelivery: (address: string, coordinates: { lat: number; lng: number }) => void;
  setDistanceResult: (miles: number, feeCents: number, eligible: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
  reset: () => void;

  // Helpers
  hasValidFulfillment: () => boolean;
  getDeliveryFeeDisplay: () => string;
}

export const useFulfillmentStore = create<FulfillmentState>()(
  persist(
    (set, get) => ({
      // Initial state
      orderType: null,
      address: null,
      coordinates: null,
      drivingDistanceMiles: null,
      deliveryFeeCents: null,
      isEligible: null,
      isModalOpen: false,

      // Actions
      setPickup: () =>
        set({
          orderType: 'pickup',
          address: null,
          coordinates: null,
          drivingDistanceMiles: null,
          deliveryFeeCents: 0,
          isEligible: true,
          isModalOpen: false,
        }),

      setDelivery: (address, coordinates) =>
        set({
          orderType: 'delivery',
          address,
          coordinates,
          // Reset computed values — they'll be set by setDistanceResult
          drivingDistanceMiles: null,
          deliveryFeeCents: null,
          isEligible: null,
        }),

      setDistanceResult: (miles, feeCents, eligible) =>
        set({
          drivingDistanceMiles: miles,
          deliveryFeeCents: feeCents,
          isEligible: eligible,
          // Only close modal if eligible
          isModalOpen: eligible ? false : get().isModalOpen,
        }),

      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),

      reset: () =>
        set({
          orderType: null,
          address: null,
          coordinates: null,
          drivingDistanceMiles: null,
          deliveryFeeCents: null,
          isEligible: null,
          isModalOpen: true, // Re-open modal to re-select
        }),

      // Helpers
      hasValidFulfillment: () => {
        const { orderType, isEligible } = get();
        if (orderType === 'pickup') return true;
        if (orderType === 'delivery') return isEligible === true;
        return false;
      },

      getDeliveryFeeDisplay: () => {
        const { orderType, deliveryFeeCents } = get();
        if (orderType === 'pickup') return 'Free';
        if (deliveryFeeCents === null) return '—';
        if (deliveryFeeCents === 0) return 'Free';
        return `$${(deliveryFeeCents / 100).toFixed(2)}`;
      },
    }),
    {
      name: 'murad-fulfillment',
      // Only persist these — never persist computed/transient values
      partialize: (state) => ({
        orderType: state.orderType,
        address: state.address,
        coordinates: state.coordinates,
      }),
    }
  )
);
