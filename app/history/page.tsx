'use client';

import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────

interface OrderSummary {
  order_number: string;
  status: string;
  customer_name: string;
  total: number;
  scheduled_date: string;
  item_count: number;
  fulfillment_type: string;
  created_at: string;
}

interface StockSummary {
  product_id: string;
  slug: string;
  name: string;
  category: string;
  product_type: string;
  quantity_on_hand: number;
  is_in_stock: boolean;
}

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

interface ProductInfo {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  base_price_cents: number;
  product_type: string;
}

interface OrderItemForm {
  category_id: string;
  product_id: string;
  quantity: number;
  selections: { id: string; quantity: number }[];
}

// ─── Status Badge ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e', dot: '#d97706' },
  confirmed: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  preparing: { bg: '#ede9fe', text: '#5b21b6', dot: '#7c3aed' },
  ready: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  out_for_delivery: { bg: '#cffafe', text: '#0e7490', dot: '#06b6d4' },
  completed: { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  cancelled: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
};

function StatusBadge({ status, onClick }: { status: string; onClick?: () => void }) {
  const colors = STATUS_COLORS[status] ?? { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' };
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
        backgroundColor: colors.bg, color: colors.text,
        border: '1px solid rgba(0,0,0,0.05)', cursor: onClick ? 'pointer' : 'default',
        boxShadow: onClick ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.dot, flexShrink: 0 }} />
      {status.replace(/_/g, ' ')}
    </button>
  );
}

function StockBadge({ inStock, qty }: { inStock: boolean; qty: number }) {
  if (inStock) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
        backgroundColor: '#dcfce7', color: '#166534', border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} />
        In Stock ({qty})
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
      backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0 }} />
      Out of Stock (0)
    </span>
  );
}

// ─── Status Update Modal ───────────────────────────────────────────────────
function StatusUpdateModal({
  order,
  onClose,
  onSuccess
}: {
  order: OrderSummary;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      await api.patch(`/history/orders/${order.order_number}/status`, { status });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Status update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(74, 15, 23, 0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: '#FAF6F0', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px',
        border: '1px solid #E8C8C8', boxShadow: '0 10px 30px rgba(74, 15, 23, 0.15)'
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px', color: '#4A0F17', fontSize: '20px', fontFamily: 'var(--font-heading)' }}>Update Status</h3>
        <p style={{ margin: '0 0 16px', color: '#8A5A2B', fontSize: '14px' }}>Order: <strong style={{ color: '#4A0F17' }}>{order.order_number}</strong></p>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ 
            width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '24px', 
            background: '#FFF', color: '#4A0F17', border: '1px solid #E8C8C8',
            fontFamily: 'var(--font-body)', outline: 'none'
          }}
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {error && <p style={{ color: '#7B1E2B', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ 
            flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #E8C8C8', 
            background: '#FFF', color: '#8A5A2B', cursor: 'pointer', fontWeight: 600 
          }}>Cancel</button>
          <button onClick={handleUpdate} disabled={loading} style={{ 
            flex: 1, padding: '12px', borderRadius: '8px', border: 'none', 
            background: '#7B1E2B', color: '#FFF', cursor: 'pointer', fontWeight: 600 
          }}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Order Modal ───────────────────────────────────────────────────────
function AddOrderModal({
  onClose,
  onSuccess
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [products, setProducts] = useState<ProductInfo[]>([]);

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    fulfillment_type: 'pickup',
  });

  const [items, setItems] = useState<OrderItemForm[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/products')
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data);
      setProducts(prodRes.data);
    }).catch(() => { });
  }, []);

  const handleCreate = async () => {
    if (!form.customer_name || !form.customer_email || !form.customer_phone) {
      setError('Customer details required.');
      return;
    }
    if (items.length === 0) {
      setError('At least one item required.');
      return;
    }

    // validate custom box items
    for (const item of items) {
      const prod = products.find(p => p.id === item.product_id);
      if (prod?.product_type === 'custom_box') {
        const totalSelected = item.selections.reduce((acc, s) => acc + s.quantity, 0);
        let boxSize = 3;
        if (prod.slug.includes('6')) boxSize = 6;
        if (prod.slug.includes('9')) boxSize = 9;
        if (totalSelected !== boxSize) {
          setError(`Custom box ${prod.name} must have exactly ${boxSize} items selected.`);
          return;
        }
      }
    }

    setLoading(true);
    setError('');

    const formattedItems = items.map(item => {
      const prod = products.find(p => p.id === item.product_id);
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        selections: prod?.product_type === 'custom_box' ? { selectedItems: item.selections } : null
      };
    });

    try {
      await api.post('/history/orders', { ...form, items: formattedItems });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Order creation failed.');
    } finally {
      setLoading(false);
    }
  };

  const drySweets = products.filter(p => p.category_id === categories.find(c => c.slug === 'dry-sweets')?.id);

  const inputStyle = {
    padding: '12px', borderRadius: '8px', background: '#FFF', 
    color: '#4A0F17', border: '1px solid #E8C8C8', outline: 'none',
    fontFamily: 'var(--font-body)', width: '100%', boxSizing: 'border-box' as const
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(74, 15, 23, 0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: '#FAF6F0', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #E8C8C8', boxShadow: '0 10px 30px rgba(74, 15, 23, 0.15)'
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 24px', color: '#4A0F17', fontSize: '24px', fontFamily: 'var(--font-heading)' }}>Manually Create Order</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#8A5A2B', marginBottom: '4px', fontWeight: 600 }}>Customer Name</label>
            <input placeholder="John Doe" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#8A5A2B', marginBottom: '4px', fontWeight: 600 }}>Email Address</label>
            <input placeholder="john@example.com" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#8A5A2B', marginBottom: '4px', fontWeight: 600 }}>Phone Number</label>
            <input placeholder="(555) 123-4567" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#8A5A2B', marginBottom: '4px', fontWeight: 600 }}>Scheduled Date</label>
            <input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <h4 style={{ color: '#4A0F17', marginBottom: '12px', fontSize: '18px', fontFamily: 'var(--font-heading)' }}>Order Items</h4>
        {items.map((item, idx) => {
          const selectedProduct = products.find(p => p.id === item.product_id);
          const isCustomBox = selectedProduct?.product_type === 'custom_box';
          let boxSize = 3;
          if (selectedProduct?.slug.includes('6')) boxSize = 6;
          if (selectedProduct?.slug.includes('9')) boxSize = 9;

          const totalSelected = item.selections.reduce((acc, s) => acc + s.quantity, 0);

          return (
            <div key={idx} style={{ marginBottom: '16px', padding: '16px', background: '#FFF', borderRadius: '12px', border: '1px solid #E8C8C8' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: isCustomBox ? '16px' : '0' }}>
                <select
                  value={item.category_id}
                  onChange={e => {
                    const newItems = [...items];
                    newItems[idx].category_id = e.target.value;
                    newItems[idx].product_id = '';
                    newItems[idx].selections = [];
                    setItems(newItems);
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                >
                  <option value="">Select Category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select
                  value={item.product_id}
                  onChange={e => {
                    const newItems = [...items];
                    newItems[idx].product_id = e.target.value;
                    newItems[idx].selections = [];
                    setItems(newItems);
                  }}
                  disabled={!item.category_id}
                  style={{ ...inputStyle, flex: 1 }}
                >
                  <option value="">Select Product...</option>
                  {products.filter(p => p.category_id === item.category_id).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <input type="number" min={1} value={item.quantity} onChange={e => {
                  const newItems = [...items];
                  newItems[idx].quantity = parseInt(e.target.value) || 1;
                  setItems(newItems);
                }} style={{ ...inputStyle, width: '80px' }} />

                <button onClick={() => setItems(items.filter((_, i) => i !== idx))} style={{ padding: '0 16px', background: '#FFF4EE', color: '#7B1E2B', border: '1px solid #E8C8C8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
              </div>

              {/* Sub-selections for custom boxes */}
              {isCustomBox && (
                <div style={{ padding: '16px', background: '#FAF6F0', borderRadius: '8px', border: '1px dashed #E8C8C8' }}>
                  <h5 style={{ margin: '0 0 12px', color: '#8A5A2B', fontSize: '14px', fontWeight: 600 }}>Select {boxSize} Items ({totalSelected}/{boxSize} selected)</h5>
                  {item.selections.map((sel, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <select
                        value={sel.id}
                        onChange={e => {
                          const newItems = [...items];
                          newItems[idx].selections[sIdx].id = e.target.value;
                          setItems(newItems);
                        }}
                        style={{ ...inputStyle, flex: 1, padding: '8px' }}
                      >
                        <option value="">Select sweet...</option>
                        {drySweets.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
                      </select>
                      <input
                        type="number" min={1} value={sel.quantity}
                        onChange={e => {
                          const newItems = [...items];
                          newItems[idx].selections[sIdx].quantity = parseInt(e.target.value) || 1;
                          setItems(newItems);
                        }}
                        style={{ ...inputStyle, width: '60px', padding: '8px' }}
                      />
                      <button onClick={() => {
                        const newItems = [...items];
                        newItems[idx].selections.splice(sIdx, 1);
                        setItems(newItems);
                      }} style={{ padding: '0 12px', background: '#FFF', color: '#7B1E2B', border: '1px solid #E8C8C8', borderRadius: '6px', cursor: 'pointer' }}>X</button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const newItems = [...items];
                    newItems[idx].selections.push({ id: '', quantity: 1 });
                    setItems(newItems);
                  }} style={{ padding: '8px 16px', borderRadius: '6px', background: '#FFF', color: '#4A0F17', border: '1px solid #E8C8C8', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginTop: '8px' }}>+ Add Sweet</button>
                </div>
              )}
            </div>
          );
        })}

        <button onClick={() => setItems([...items, { category_id: '', product_id: '', quantity: 1, selections: [] }])} style={{ padding: '12px 20px', borderRadius: '8px', background: '#FFF', color: '#4A0F17', border: '1px dashed #E8C8C8', cursor: 'pointer', marginBottom: '24px', fontWeight: 600, width: '100%' }}>+ Add New Line Item</button>

        {error && <div style={{ background: '#FFF4EE', color: '#7B1E2B', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #E8C8C8', fontSize: '14px' }}>{error}</div>}
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #E8C8C8', background: '#FFF', color: '#8A5A2B', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          <button onClick={handleCreate} disabled={loading} style={{ flex: 1, padding: '14px', borderRadius: '8px', border: 'none', background: '#7B1E2B', color: '#FFF', cursor: 'pointer', fontWeight: 600 }}>{loading ? 'Creating Order...' : 'Confirm & Create Order'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [stock, setStock] = useState<StockSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingStock, setLoadingStock] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'stock'>('orders');
  const [orderFilter, setOrderFilter] = useState('all');

  const [statusTarget, setStatusTarget] = useState<OrderSummary | null>(null);
  const [showAddOrder, setShowAddOrder] = useState(false);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('/history/orders');
      setOrders(res.data);
    } catch { /* silent */ } finally {
      setLoadingOrders(false);
    }
  };

  const fetchStock = async () => {
    setLoadingStock(true);
    try {
      const res = await api.get('/history/stock');
      setStock(res.data);
    } catch { /* silent */ } finally {
      setLoadingStock(false);
    }
  };

  useEffect(() => { fetchOrders(); fetchStock(); }, []);

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-cream, #FFE9E1)',
      fontFamily: 'var(--font-body, "Lato", sans-serif)',
      color: 'var(--color-primary-deep, #4A0F17)',
      paddingBottom: '60px'
    }}>
      <div style={{ 
        background: '#FFF', 
        borderBottom: '1px solid #E8C8C8', 
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: '0 2px 10px rgba(74, 15, 23, 0.05)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontFamily: 'var(--font-heading)', color: '#7B1E2B' }}>
              Dashboard
            </h1>
            <p style={{ margin: '4px 0 0', color: '#8A5A2B', fontSize: '14px' }}>Overview of orders and stock levels</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddOrder(true)}
              style={{ 
                padding: '10px 20px', borderRadius: '8px', border: 'none', 
                background: '#7B1E2B', color: '#FFF', fontSize: '14px', fontWeight: 600, 
                cursor: 'pointer', boxShadow: '0 4px 10px rgba(123, 30, 43, 0.15)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              + Add Order
            </button>
            <button
              onClick={() => { fetchOrders(); fetchStock(); }}
              style={{ 
                padding: '10px 20px', borderRadius: '8px', border: '1px solid #E8C8C8', 
                background: '#FFF', color: '#4A0F17', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAF6F0'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFF'}
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: '#FFF', borderRadius: '12px', padding: '6px', width: 'fit-content', border: '1px solid #E8C8C8', boxShadow: '0 4px 15px rgba(74, 15, 23, 0.05)' }}>
          {(['orders', 'stock'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: activeTab === tab ? '#FAF6F0' : 'transparent',
                color: activeTab === tab ? '#7B1E2B' : '#8A5A2B',
                fontSize: '15px', fontWeight: 700,
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-subheading)'
              }}
            >
              {tab === 'orders' ? `Orders (${orders.length})` : `Stock Tracker (${stock.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map(f => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  style={{
                    padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                    border: '1px solid', cursor: 'pointer',
                    borderColor: orderFilter === f ? '#7B1E2B' : '#E8C8C8',
                    background: orderFilter === f ? '#7B1E2B' : '#FFF',
                    color: orderFilter === f ? '#FFF' : '#8A5A2B',
                    transition: 'all 0.2s',
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>

            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#8A5A2B', fontSize: '16px' }}>Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#8A5A2B', fontSize: '16px', background: '#FFF', borderRadius: '16px', border: '1px dashed #E8C8C8' }}>No orders found for this filter.</div>
            ) : (
              <div style={{ background: '#FFF', border: '1px solid #E8C8C8', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(74, 15, 23, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E8C8C8', background: '#FAF6F0' }}>
                      {['Order #', 'Customer', 'Date Placed', 'Type', 'Items', 'Total', 'Status'].map(h => (
                        <th key={h} style={{ padding: '16px 20px', textAlign: 'left', color: '#4A0F17', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', fontFamily: 'var(--font-subheading)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, i) => (
                      <tr
                        key={order.order_number}
                        style={{ borderBottom: i < filteredOrders.length - 1 ? '1px solid #E8C8C8' : 'none', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAF6F0'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#7B1E2B' }}>
                          {order.order_number}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#4A0F17', fontWeight: 600 }}>{order.customer_name}</td>
                        <td style={{ padding: '16px 20px', color: '#8A5A2B', whiteSpace: 'nowrap' }}>
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: order.fulfillment_type === 'delivery' ? '#E1F5FE' : '#F3E5F5', color: order.fulfillment_type === 'delivery' ? '#0277BD' : '#7B1FA2', border: '1px solid rgba(0,0,0,0.05)' }}>
                            {order.fulfillment_type === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#4A0F17', textAlign: 'center', fontWeight: 600 }}>{order.item_count}</td>
                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#2E7D32', whiteSpace: 'nowrap' }}>
                          ${order.total.toFixed(2)}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <StatusBadge status={order.status} onClick={() => setStatusTarget(order)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stock' && (
          <div>
            {loadingStock ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#8A5A2B', fontSize: '16px' }}>Loading stock data...</div>
            ) : stock.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#8A5A2B', fontSize: '16px', background: '#FFF', borderRadius: '16px', border: '1px dashed #E8C8C8' }}>No tracked products found.</div>
            ) : (
              <div style={{ background: '#FFF', border: '1px solid #E8C8C8', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(74, 15, 23, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E8C8C8', background: '#FAF6F0' }}>
                      {['Product', 'Qty on Hand', 'Status'].map(h => (
                        <th key={h} style={{ padding: '16px 20px', textAlign: 'left', color: '#4A0F17', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', fontFamily: 'var(--font-subheading)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((item, i) => (
                      <tr key={item.product_id} style={{ borderBottom: i < stock.length - 1 ? '1px solid #E8C8C8' : 'none', transition: 'background 0.2s', background: item.quantity_on_hand === 0 ? '#FFF4EE' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#FAF6F0'} onMouseLeave={e => e.currentTarget.style.background = item.quantity_on_hand === 0 ? '#FFF4EE' : 'transparent'}>
                        <td style={{ padding: '16px 20px', color: '#4A0F17', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '16px 20px', fontSize: '20px', fontWeight: 800, color: item.quantity_on_hand === 0 ? '#D32F2F' : '#4A0F17' }}>{item.quantity_on_hand}</td>
                        <td style={{ padding: '16px 20px' }}><StockBadge inStock={item.is_in_stock} qty={item.quantity_on_hand} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {statusTarget && <StatusUpdateModal order={statusTarget} onClose={() => setStatusTarget(null)} onSuccess={() => { fetchOrders(); fetchStock(); }} />}
      {showAddOrder && <AddOrderModal onClose={() => setShowAddOrder(false)} onSuccess={() => { fetchOrders(); fetchStock(); }} />}
    </div>
  );
}
