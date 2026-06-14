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

interface OrderItemDetail {
  name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  selections: { selectedItems?: { name: string; quantity: number }[] } | null;
}

interface OrderDetail {
  order_number: string;
  status: string;
  customer: {
    full_name: string;
    email: string;
    phone: string;
  };
  total: number;
  scheduled_date: string;
  scheduled_slot: string;
  fulfillment_type: string;
  created_at: string | null;
  notes: string | null;
  admin_notes: string | null;
  items: OrderItemDetail[];
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

// ─── Status Badge & Config ───────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E', dot: '#D97706', label: '⏳ Pending' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: '✅ Confirmed' },
  preparing: { bg: '#EDE9FE', text: '#5B21B6', dot: '#7C3AED', label: '🥣 Preparing' },
  ready: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: '📦 Ready' },
  out_for_delivery: { bg: '#CFFAFE', text: '#0E7490', dot: '#06B6D4', label: '🚴 Out for Delivery' },
  completed: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: '🎉 Completed' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: '❌ Cancelled' },
};

function StatusBadge({ status, onClick }: { status: string; onClick?: () => void }) {
  const config = STATUS_COLORS[status] ?? { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF', label: status };
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
        backgroundColor: config.bg, color: config.text,
        border: '1px solid rgba(0,0,0,0.05)', cursor: onClick ? 'pointer' : 'default',
        boxShadow: onClick ? '0 2px 4px rgba(74, 15, 23, 0.05)' : 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: config.dot, flexShrink: 0 }} />
      {config.label}
    </button>
  );
}

function StockBadge({ inStock, qty }: { inStock: boolean; qty: number }) {
  if (inStock) {
    const isLow = qty <= 10;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
        backgroundColor: isLow ? '#FEF3C7' : '#D1FAE5',
        color: isLow ? '#92400E' : '#065F46',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isLow ? '#D97706' : '#10B981', flexShrink: 0 }} />
        {isLow ? `Low Stock (${qty})` : `In Stock (${qty})`}
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
      backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444', flexShrink: 0 }} />
      Out of Stock
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
            fontFamily: 'var(--font-body)', outline: 'none', fontWeight: 600
          }}
        >
          {Object.keys(STATUS_COLORS).map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
          ))}
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

// ─── Order Detail Modal ────────────────────────────────────────────────────
function OrderDetailModal({
  orderNumber,
  onClose,
  onStatusUpdated
}: {
  orderNumber: string;
  onClose: () => void;
  onStatusUpdated: () => void;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/history/orders/${orderNumber}`);
      setOrder(res.data);
    } catch {
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNumber]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    setStatusError('');
    try {
      await api.patch(`/history/orders/${order.order_number}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      onStatusUpdated();
    } catch (e: any) {
      setStatusError(e?.response?.data?.detail ?? 'Status update failed.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(74, 15, 23, 0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}>
        <div style={{ background: '#FAF6F0', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #E8C8C8' }}>
          <p style={{ color: '#8A5A2B', fontWeight: 600 }}>Loading Order Details...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(74, 15, 23, 0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: '#FAF6F0', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #E8C8C8', boxShadow: '0 10px 30px rgba(74, 15, 23, 0.15)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E8C8C8', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#4A0F17', fontSize: '22px', fontFamily: 'var(--font-heading)' }}>Order #{order.order_number}</h3>
            <p style={{ margin: '4px 0 0', color: '#8A5A2B', fontSize: '13px' }}>
              Placed on {new Date(order.created_at || '').toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', color: '#8A5A2B' }}>✕</button>
        </div>

        {/* Customer & Fulfillment Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', border: '1px solid #E8C8C8' }}>
            <h4 style={{ margin: '0 0 10px', color: '#7B1E2B', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Info</h4>
            <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 600, color: '#4A0F17' }}>{order.customer.full_name}</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#8A5A2B' }}>📞 {order.customer.phone}</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#8A5A2B' }}>✉️ {order.customer.email}</p>
          </div>
          
          <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', border: '1px solid #E8C8C8' }}>
            <h4 style={{ margin: '0 0 10px', color: '#7B1E2B', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fulfillment Detail</h4>
            <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 600, color: '#4A0F17' }}>
              {order.fulfillment_type === 'delivery' ? '🚗 Local Delivery' : '🏪 In-store Pickup'}
            </p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#8A5A2B' }}>📅 {order.scheduled_date}</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#8A5A2B' }}>🕒 {order.scheduled_slot}</p>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', border: '1px solid #E8C8C8', marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 14px', color: '#7B1E2B', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items ordered</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ borderBottom: idx < order.items.length - 1 ? '1px solid #FAF6F0' : 'none', paddingBottom: idx < order.items.length - 1 ? '12px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#4A0F17' }}>{item.name}</span>
                    <span style={{ color: '#8A5A2B', fontSize: '13px', marginLeft: '8px' }}>x{item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#4A0F17' }}>${item.line_total.toFixed(2)}</span>
                </div>
                
                {/* Render Custom Box selections if present */}
                {item.selections?.selectedItems && (
                  <div style={{ marginTop: '6px', padding: '8px 12px', background: '#FAF6F0', borderRadius: '6px', borderLeft: '3px solid #7B1E2B' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#8A5A2B' }}>Box Contents:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                      {item.selections.selectedItems.map((selItem, sIdx) => (
                        <div key={sIdx} style={{ fontSize: '12px', color: '#4A0F17' }}>
                          • {selItem.name} <span style={{ fontWeight: 600, color: '#8A5A2B' }}>(x{selItem.quantity})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div style={{ borderTop: '2px solid #FAF6F0', marginTop: '16px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '16px', color: '#4A0F17' }}>
            <span>Total Value</span>
            <span style={{ color: '#2E7D32' }}>${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div style={{ background: '#FFF4EE', padding: '16px', borderRadius: '12px', border: '1px solid #E8C8C8', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 6px', color: '#7B1E2B', fontSize: '13px', fontWeight: 700 }}>Customer Note:</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#4A0F17', fontStyle: 'italic' }}>"{order.notes}"</p>
          </div>
        )}

        {/* Status Actions */}
        <div style={{ borderTop: '1px solid #E8C8C8', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#8A5A2B', marginBottom: '6px', fontWeight: 600 }}>Update Order Status</label>
            <select
              value={order.status}
              disabled={updatingStatus}
              onChange={e => handleStatusChange(e.target.value)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: '1px solid #E8C8C8',
                background: '#FFF', color: '#4A0F17', fontWeight: 600, outline: 'none'
              }}
            >
              {Object.keys(STATUS_COLORS).map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #E8C8C8', background: '#FFF', color: '#8A5A2B', fontWeight: 600, cursor: 'pointer' }}>Close Details</button>
        </div>
        {statusError && <p style={{ color: '#7B1E2B', fontSize: '13px', marginTop: '10px', margin: 0 }}>{statusError}</p>}
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
        selections: prod?.product_type === 'custom_box' ? { selectedItems: item.selections.map(s => {
          const sw = products.find(p => p.id === s.id);
          return { name: sw?.name ?? '', quantity: s.quantity };
        }) } : null
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
            <input placeholder="(346) 368-4831" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} style={inputStyle} />
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
  
  // Search & Sorting States
  const [orderQuery, setOrderQuery] = useState('');
  const [stockQuery, setStockQuery] = useState('');
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  // Modal targets
  const [statusTarget, setStatusTarget] = useState<OrderSummary | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const [showAddOrder, setShowAddOrder] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('/history/orders');
      setOrders(res.data);
    } catch {
      showToast('Failed to load orders.', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchStock = async () => {
    setLoadingStock(true);
    try {
      const res = await api.get('/history/stock');
      setStock(res.data);
    } catch {
      showToast('Failed to load stock data.', 'error');
    } finally {
      setLoadingStock(false);
    }
  };

  useEffect(() => { fetchOrders(); fetchStock(); }, []);

  // Quick statistics calculation
  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const lowStockCount = stock.filter(s => s.quantity_on_hand <= 10).length;

  // Filtered orders list
  const filteredOrders = orders.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(orderQuery.toLowerCase()) ||
      order.order_number.toLowerCase().includes(orderQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered stock list
  const filteredStock = stock.filter(item => 
    item.name.toLowerCase().includes(stockQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(stockQuery.toLowerCase())
  );

  // Update product stock on hand
  const handleStockQtyChange = async (productId: string, newQty: number) => {
    if (newQty < 0) return;
    setUpdatingStockId(productId);
    try {
      // Auto toggle stock presence based on qty > 0
      const inStock = newQty > 0;
      await api.patch(`/history/stock/${productId}`, {
        quantity_on_hand: newQty,
        is_in_stock: inStock
      });
      
      // Update local state
      setStock(prev => prev.map(s => 
        s.product_id === productId ? { ...s, quantity_on_hand: newQty, is_in_stock: inStock } : s
      ));
      showToast('Stock quantity updated successfully.');
    } catch {
      showToast('Failed to update stock quantity.', 'error');
    } finally {
      setUpdatingStockId(null);
    }
  };

  // Toggle is_in_stock directly
  const handleToggleStockAvailability = async (productId: string, currentInStock: boolean) => {
    setUpdatingStockId(productId);
    const newInStock = !currentInStock;
    const targetItem = stock.find(s => s.product_id === productId);
    const newQty = newInStock ? (targetItem?.quantity_on_hand === 0 ? 10 : targetItem?.quantity_on_hand ?? 10) : 0;
    try {
      await api.patch(`/history/stock/${productId}`, {
        quantity_on_hand: newQty,
        is_in_stock: newInStock
      });

      setStock(prev => prev.map(s => 
        s.product_id === productId ? { ...s, quantity_on_hand: newQty, is_in_stock: newInStock } : s
      ));
      showToast(newInStock ? 'Item set to in-stock.' : 'Item set to out-of-stock.');
    } catch {
      showToast('Failed to toggle stock status.', 'error');
    } finally {
      setUpdatingStockId(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-cream, #FFE9E1)',
      fontFamily: 'var(--font-body, "Lato", sans-serif)',
      color: 'var(--color-primary-deep, #4A0F17)',
      paddingBottom: '80px'
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000,
          background: toast.type === 'success' ? '#10B981' : '#EF4444',
          color: '#FFF', padding: '12px 24px', borderRadius: '8px', fontWeight: 600,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)', animation: 'slideIn 0.3s ease-out',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {toast.type === 'success' ? '⚡' : '⚠️'} {toast.message}
        </div>
      )}

      {/* Top sticky navbar */}
      <div style={{ 
        background: '#FFF', 
        borderBottom: '1px solid #E8C8C8', 
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: '0 2px 10px rgba(74, 15, 23, 0.05)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '26px', fontFamily: 'var(--font-heading)', color: '#7B1E2B' }}>
              Admin Management Portal
            </h1>
            <p style={{ margin: '2px 0 0', color: '#8A5A2B', fontSize: '13px' }}>Fulfillment and Live Stock Tracking Dashboard</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddOrder(true)}
              style={{ 
                padding: '10px 20px', borderRadius: '8px', border: 'none', 
                background: '#7B1E2B', color: '#FFF', fontSize: '14px', fontWeight: 600, 
                cursor: 'pointer', boxShadow: '0 4px 10px rgba(123, 30, 43, 0.15)',
                transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>+</span> Manual Order
            </button>
            <button
              onClick={() => { fetchOrders(); fetchStock(); showToast('Dashboard refreshed.'); }}
              style={{ 
                padding: '10px 20px', borderRadius: '8px', border: '1px solid #E8C8C8', 
                background: '#FFF', color: '#4A0F17', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAF6F0'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFF'}
            >
              ↻ Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>
        
        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #E8C8C8', boxShadow: '0 4px 10px rgba(74, 15, 23, 0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8A5A2B', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              <span>TOTAL SALES</span>
              <span>💰</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#2E7D32' }}>${totalSales.toFixed(2)}</div>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#8A5A2B' }}>Excludes cancelled orders</p>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #E8C8C8', boxShadow: '0 4px 10px rgba(74, 15, 23, 0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8A5A2B', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              <span>PENDING ORDERS</span>
              <span>⏳</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#E28743' }}>{pendingOrdersCount}</div>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#8A5A2B' }}>Awaiting store confirmation</p>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #E8C8C8', boxShadow: '0 4px 10px rgba(74, 15, 23, 0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8A5A2B', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              <span>TOTAL ORDERS</span>
              <span>📋</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#4A0F17' }}>{orders.length}</div>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#8A5A2B' }}>Across all categories</p>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #E8C8C8', boxShadow: '0 4px 10px rgba(74, 15, 23, 0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8A5A2B', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              <span>LOW STOCK ALERT</span>
              <span>🚨</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: lowStockCount > 0 ? '#D32F2F' : '#2E7D32' }}>{lowStockCount}</div>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#8A5A2B' }}>Items under 10 units</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#FFF', borderRadius: '12px', padding: '6px', width: 'fit-content', border: '1px solid #E8C8C8', boxShadow: '0 4px 15px rgba(74, 15, 23, 0.05)' }}>
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
              {tab === 'orders' ? `📦 Orders (${orders.length})` : `📉 Stock Tracker (${stock.length})`}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB CONTENT ── */}
        {activeTab === 'orders' && (
          <div>
            
            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'].map(f => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    style={{
                      padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                      border: '1px solid', cursor: 'pointer',
                      borderColor: orderFilter === f ? '#7B1E2B' : '#E8C8C8',
                      background: orderFilter === f ? '#7B1E2B' : '#FFF',
                      color: orderFilter === f ? '#FFF' : '#8A5A2B',
                      transition: 'all 0.2s',
                    }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search orders by customer or number..."
                value={orderQuery}
                onChange={e => setOrderQuery(e.target.value)}
                style={{
                  padding: '10px 16px', borderRadius: '8px', border: '1px solid #E8C8C8',
                  width: '320px', outline: 'none', background: '#FFF', color: '#4A0F17'
                }}
              />
            </div>

            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#8A5A2B', fontSize: '16px' }}>Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#8A5A2B', fontSize: '16px', background: '#FFF', borderRadius: '16px', border: '1px dashed #E8C8C8' }}>No orders found for this search.</div>
            ) : (
              <div style={{ background: '#FFF', border: '1px solid #E8C8C8', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(74, 15, 23, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E8C8C8', background: '#FAF6F0' }}>
                      {['Order #', 'Customer', 'Date Placed', 'Type', 'Items', 'Total', 'Status', 'Details'].map(h => (
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
                        <td style={{ padding: '16px 20px' }}>
                          <button
                            onClick={() => setSelectedOrderNumber(order.order_number)}
                            style={{
                              padding: '6px 12px', borderRadius: '6px', border: '1px solid #7B1E2B',
                              background: '#FFF', color: '#7B1E2B', fontSize: '12px', fontWeight: 700,
                              cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#7B1E2B'; e.currentTarget.style.color = '#FFF'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#FFF'; e.currentTarget.style.color = '#7B1E2B'; }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── STOCK TAB CONTENT ── */}
        {activeTab === 'stock' && (
          <div>
            
            {/* Search Stock bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Search stock items by name or category..."
                value={stockQuery}
                onChange={e => setStockQuery(e.target.value)}
                style={{
                  padding: '10px 16px', borderRadius: '8px', border: '1px solid #E8C8C8',
                  width: '320px', outline: 'none', background: '#FFF', color: '#4A0F17'
                }}
              />
            </div>

            {loadingStock ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#8A5A2B', fontSize: '16px' }}>Loading stock data...</div>
            ) : filteredStock.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#8A5A2B', fontSize: '16px', background: '#FFF', borderRadius: '16px', border: '1px dashed #E8C8C8' }}>No tracked products found.</div>
            ) : (
              <div style={{ background: '#FFF', border: '1px solid #E8C8C8', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(74, 15, 23, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E8C8C8', background: '#FAF6F0' }}>
                      {['Product Name', 'Category', 'Quantity on Hand', 'Stock Presence Status', 'Quick Actions'].map(h => (
                        <th key={h} style={{ padding: '16px 20px', textAlign: 'left', color: '#4A0F17', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', fontFamily: 'var(--font-subheading)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.map((item, i) => {
                      const isLow = item.quantity_on_hand <= 10 && item.is_in_stock;
                      return (
                        <tr 
                          key={item.product_id} 
                          style={{ 
                            borderBottom: i < filteredStock.length - 1 ? '1px solid #E8C8C8' : 'none', 
                            transition: 'background 0.2s', 
                            background: !item.is_in_stock ? '#FEE2E2' : (isLow ? '#FEF3C7' : 'transparent') 
                          }} 
                          onMouseEnter={e => e.currentTarget.style.background = '#FAF6F0'} 
                          onMouseLeave={e => e.currentTarget.style.background = !item.is_in_stock ? '#FEE2E2' : (isLow ? '#FEF3C7' : 'transparent')}
                        >
                          <td style={{ padding: '16px 20px', color: '#4A0F17', fontWeight: 600 }}>{item.name}</td>
                          
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', background: '#F5F5F5', color: '#616161', border: '1px solid rgba(0,0,0,0.05)' }}>
                              {item.category.toUpperCase()}
                            </span>
                          </td>
                          
                          <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                disabled={updatingStockId !== null}
                                onClick={() => handleStockQtyChange(item.product_id, item.quantity_on_hand - 1)}
                                style={{
                                  width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #E8C8C8',
                                  background: '#FFF', color: '#4A0F17', fontWeight: 800, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                              >-</button>
                              
                              <input
                                type="number"
                                min={0}
                                value={item.quantity_on_hand}
                                disabled={updatingStockId !== null}
                                onChange={e => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) {
                                    handleStockQtyChange(item.product_id, val);
                                  }
                                }}
                                style={{
                                  width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #E8C8C8',
                                  textAlign: 'center', fontWeight: 'bold', outline: 'none'
                                }}
                              />

                              <button
                                disabled={updatingStockId !== null}
                                onClick={() => handleStockQtyChange(item.product_id, item.quantity_on_hand + 1)}
                                style={{
                                  width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #E8C8C8',
                                  background: '#FFF', color: '#4A0F17', fontWeight: 800, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                              >+</button>
                            </div>
                          </td>
                          
                          <td style={{ padding: '16px 20px' }}>
                            <StockBadge inStock={item.is_in_stock} qty={item.quantity_on_hand} />
                          </td>

                          <td style={{ padding: '16px 20px' }}>
                            <button
                              disabled={updatingStockId !== null}
                              onClick={() => handleToggleStockAvailability(item.product_id, item.is_in_stock)}
                              style={{
                                padding: '6px 14px', borderRadius: '6px', border: 'none',
                                background: item.is_in_stock ? '#EF4444' : '#10B981',
                                color: '#FFF', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                width: '120px'
                              }}
                            >
                              {updatingStockId === item.product_id ? 'saving...' : (item.is_in_stock ? 'Mark Out' : 'Mark In-Stock')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {statusTarget && <StatusUpdateModal order={statusTarget} onClose={() => setStatusTarget(null)} onSuccess={() => { fetchOrders(); fetchStock(); showToast('Order status updated.'); }} />}
      {selectedOrderNumber && <OrderDetailModal orderNumber={selectedOrderNumber} onClose={() => setSelectedOrderNumber(null)} onStatusUpdated={() => { fetchOrders(); fetchStock(); showToast('Order status updated.'); }} />}
      {showAddOrder && <AddOrderModal onClose={() => setShowAddOrder(false)} onSuccess={() => { fetchOrders(); fetchStock(); showToast('Manual order created successfully.'); }} />}
    </div>
  );
}
