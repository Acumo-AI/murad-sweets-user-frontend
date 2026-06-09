import { create } from 'zustand';
import { getCategories, getProducts } from '../lib/api';
import { Product } from '../data/products';

interface CatalogState {
  products: Product[];
  categories: any[];
  isLoading: boolean;
  error: string | null;
  fetchCatalog: () => Promise<void>;
}

export const useCatalog = create<CatalogState>((set, get) => ({
  products: [],
  categories: [],
  isLoading: true,
  error: null,
  fetchCatalog: async () => {
    if (get().products.length > 0 && !get().isLoading) return; // Prevent duplicate fetches
    set({ isLoading: true, error: null });
    try {
      const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
      const mappedProds: Product[] = prods.map((p: any) => {
        const cat = cats.find((c: any) => c.id === p.category_id);
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: cat ? cat.slug : 'specialty',
          description: p.description,
          price: p.base_price_cents / 100,
          unit: p.unit_label,
          images: p.metadata?.images || [],
          inStock: p.is_in_stock,
          minOrderQty: p.min_quantity,
          product_type: p.product_type
        };
      });
      set({ categories: cats, products: mappedProds, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch catalog', err);
      set({ error: 'Failed to fetch catalog', isLoading: false });
    }
  }
}));
