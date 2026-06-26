import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ShieldCheck, BarChart3, ListFilter, Sliders, 
  FileSpreadsheet, Upload, CheckCircle2, ChevronRight,
  Users, Trash2
} from 'lucide-react';
import { TerminalBootLoader, OrdersSkeleton, SkeletonBlock } from '../components/LoadingIndicator.jsx';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  
  // Tabs: 'analytics', 'fulfillment', 'inventory', 'cms', 'users'
  const [activeTab, setActiveTab] = useState('analytics');

  // Users state (Superadmin only)
  const [users, setUsers] = useState([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersSuccess, setUsersSuccess] = useState('');
  const [usersError, setUsersError] = useState('');

  // Load States
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // CMS inputs
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('');
  const [featuredProds, setFeaturedProds] = useState('');
  const [cmsSuccess, setCmsSuccess] = useState('');
  const [cmsError, setCmsError] = useState('');

  // CSV Import state
  const [csvData, setCsvData] = useState('');
  const [importResult, setImportResult] = useState('');
  const [importError, setImportError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Analytics
      const aRes = await fetch('/api/orders/admin/analytics');
      if (aRes.ok) {
        const body = await aRes.json();
        setAnalytics(body.data.analytics);
      }

      // 2. Fetch Orders
      const oRes = await fetch('/api/orders/admin/all');
      if (oRes.ok) {
        const body = await oRes.json();
        setOrders(body.data.orders || []);
      }

      // 3. Fetch Products (for inventory list and CMS choices)
      const pRes = await fetch('/api/products/catalog?limit=100');
      if (pRes.ok) {
        const body = await pRes.json();
        setProducts(body.data.products || []);
      }

      // 4. Fetch CMS (for preset configurator values)
      const cRes = await fetch('/api/cms');
      if (cRes.ok) {
        const body = await cRes.json();
        const cms = body.data.cms;
        setHeroTitle(cms?.heroBanner?.title || '');
        setHeroSubtitle(cms?.heroBanner?.subtitle || '');
        setHeroCtaText(cms?.heroBanner?.ctaText || '');
        setFeaturedProds(cms?.featuredProducts?.map((p) => p._id).join(', ') || '');
      }

      // 5. Fetch Users (if superadmin)
      if (user && user.role === 'superadmin') {
        const uRes = await fetch('/api/users/admin/all');
        if (uRes.ok) {
          const body = await uRes.json();
          setUsers(body.data.users || []);
        }
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'editor')) {
      fetchDashboardData();
    }
  }, [user]);

  // Update order fulfillment status
  const handleUpdateStatus = async (orderId, fulfillmentStatus) => {
    try {
      const response = await fetch(`/api/orders/admin/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentStatus })
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Update SKU inventory count
  const handleUpdateStock = async (productId, newStockCount) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory: {
            countInStock: Number(newStockCount)
          }
        })
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  // Purge/Delete user account (Superadmin only)
  const handleDeleteUser = async (userId) => {
    setUsersError('');
    setUsersSuccess('');
    
    // Safety check to prevent deleting yourself
    if (user && user._id === userId) {
      setUsersError('SELF_DESTRUCTION_PREVENTED: Cannot purge your own active session.');
      return;
    }

    if (!window.confirm('CRITICAL ACTION: Purge this user identity from database?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/admin/${userId}`, {
        method: 'DELETE'
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'Purge protocol failed.');
      }
      setUsersSuccess('USER_PURGED_SUCCESSFULLY');
      // Reload users list
      fetchDashboardData();
    } catch (err) {
      setUsersError(err.message);
    }
  };

  // CMS configuration commit
  const handleCMSUpdate = async (e) => {
    e.preventDefault();
    setCmsError('');
    setCmsSuccess('');

    try {
      const prodIdArray = featuredProds ? featuredProds.split(',').map((p) => p.trim()) : [];
      const response = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBanner: {
            title: heroTitle,
            subtitle: heroSubtitle,
            ctaText: heroCtaText
          },
          featuredProducts: prodIdArray
        })
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'CMS update failed');
      }

      setCmsSuccess('HOMEPAGE_CMS_UPLINK_COMMITTED');
    } catch (err) {
      setCmsError(err.message);
    }
  };

  // CSV Import execution
  const handleCSVImport = async (e) => {
    e.preventDefault();
    setImportError('');
    setImportResult('');

    try {
      const response = await fetch('/api/products/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData })
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'CSV parse error');
      }

      setImportResult(`SUCCESS: ${body.data.successCount} PRODUCTS ADDED / MODIFIED`);
      setCsvData('');
      fetchDashboardData();
    } catch (err) {
      setImportError(err.message);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 font-mono text-soft-ash space-y-8">
        <div className="flex items-center justify-between border-b border-acid/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-hazard animate-pulse" />
            <h2 className="font-display font-black text-xl tracking-widest text-hazard">
              ADMIN_NEXUS_COMMAND
            </h2>
          </div>
        </div>
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <TerminalBootLoader title="AUTHENTICATING_ADMIN" />
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'editor')) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center font-mono text-soft-ash">
        <p>// ACCESS DENIED. ADMIN OR EDITOR SECURE KEY REQUIREMENT NOT MET</p>
      </div>
    );
  }

  const renderAnalyticsSkeleton = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonBlock height="h-24" rounded="rounded" shape="clip-chamfer" />
        <SkeletonBlock height="h-24" rounded="rounded" shape="clip-chamfer" />
        <SkeletonBlock height="h-24" rounded="rounded" shape="clip-chamfer" />
      </div>
      <div className="bg-sludge border border-acid/15 p-5 rounded clip-chamfer h-[350px]">
        <SkeletonBlock height="h-full" />
      </div>
    </div>
  );

  const renderInventorySkeleton = () => (
    <div className="grid grid-cols-1 gap-8">
      <div className="bg-sludge border border-acid/15 p-5 rounded clip-chamfer space-y-4">
        <SkeletonBlock height="h-6" width="w-1/4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <SkeletonBlock height="h-10" width="w-20" />
              <SkeletonBlock height="h-10" className="flex-grow" />
              <SkeletonBlock height="h-10" width="w-24" />
              <SkeletonBlock height="h-10" width="w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCMSSkeleton = () => (
    <div className="bg-sludge border border-acid/15 p-5 rounded clip-chamfer space-y-4">
      <SkeletonBlock height="h-6" width="w-1/3" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1">
            <SkeletonBlock height="h-3" width="w-1/6" />
            <SkeletonBlock height="h-9" />
          </div>
        ))}
        <SkeletonBlock height="h-10" width="w-36" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-mono text-soft-ash space-y-8">
      
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-acid/20 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-hazard animate-pulse" />
          <h2 className="font-display font-black text-xl tracking-widest text-hazard">
            ADMIN_NEXUS_COMMAND
          </h2>
        </div>
        <span className="text-[10px] text-soft-ash/60 border border-hazard/30 bg-hazard/5 px-2.5 py-1 rounded">
          OPERATOR: {user.role.toUpperCase()}
        </span>
      </div>

      {/* Tabs list selector */}
      <div className="flex flex-col sm:flex-row border border-acid/20 rounded bg-sludge text-xs">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-3 font-bold border-b sm:border-b-0 sm:border-r border-acid/15 flex items-center justify-center gap-1.5 transition-all ${activeTab === 'analytics' ? 'bg-acid/15 text-acid' : 'hover:bg-void'}`}
        >
          <BarChart3 className="h-4 w-4" /> ANALYTICS
        </button>
        <button
          onClick={() => setActiveTab('fulfillment')}
          className={`flex-1 py-3 font-bold border-b sm:border-b-0 sm:border-r border-acid/15 flex items-center justify-center gap-1.5 transition-all ${activeTab === 'fulfillment' ? 'bg-acid/15 text-acid' : 'hover:bg-void'}`}
        >
          <ListFilter className="h-4 w-4" /> fulfillment
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-3 font-bold border-b sm:border-b-0 sm:border-r border-acid/15 flex items-center justify-center gap-1.5 transition-all ${activeTab === 'inventory' ? 'bg-acid/15 text-acid' : 'hover:bg-void'}`}
        >
          <FileSpreadsheet className="h-4 w-4" /> SKU_INVENTORY
        </button>
        <button
          onClick={() => setActiveTab('cms')}
          className={`flex-1 py-3 font-bold ${user.role === 'superadmin' ? 'border-b sm:border-b-0 sm:border-r border-acid/15' : ''} flex items-center justify-center gap-1.5 transition-all ${activeTab === 'cms' ? 'bg-acid/15 text-acid' : 'hover:bg-void'}`}
        >
          <Sliders className="h-4 w-4" /> HOME_CMS
        </button>
        {user.role === 'superadmin' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 font-bold flex items-center justify-center gap-1.5 transition-all ${activeTab === 'users' ? 'bg-acid/15 text-acid' : 'hover:bg-void'}`}
          >
            <Users className="h-4 w-4" /> RUNNER_REGISTRY
          </button>
        )}
      </div>

      <div className="space-y-6">
        {loading ? (
          activeTab === 'analytics' ? renderAnalyticsSkeleton() :
          activeTab === 'fulfillment' ? <OrdersSkeleton /> :
          activeTab === 'inventory' ? renderInventorySkeleton() :
          activeTab === 'cms' ? renderCMSSkeleton() :
          activeTab === 'users' ? (
            <div className="bg-sludge border border-acid/15 p-5 rounded clip-chamfer space-y-4 animate-pulse">
              <SkeletonBlock height="h-6" width="w-1/3" />
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <SkeletonBlock key={i} height="h-12" />
                ))}
              </div>
            </div>
          ) : null
        ) : (
          <>
          
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-8">
              
              {/* Scorecard grid panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-sludge border border-acid/20 rounded clip-chamfer shadow-acid space-y-2">
                  <span className="text-[9px] text-acid/60">// GROSS_MERCHANDISE_VOLUME</span>
                  <p className="font-arcade text-lg text-acid">${analytics.gmv.toFixed(2)}</p>
                </div>
                <div className="p-5 bg-sludge border border-hazard/20 rounded clip-chamfer shadow-hazard space-y-2">
                  <span className="text-[9px] text-hazard/60">// ACTIVE_CARGO_CORES</span>
                  <p className="font-arcade text-lg text-hazard">{analytics.activeCarts}</p>
                </div>
                <div className="p-5 bg-sludge border border-blaze/20 rounded clip-chamfer shadow-blaze space-y-2">
                  <span className="text-[9px] text-blaze/60">// UPLINK_CONVERSION_RATE</span>
                  <p className="font-arcade text-lg text-blaze">{analytics.conversionRate.toFixed(2)}%</p>
                </div>
              </div>

              {/* Chart Panel */}
              <div className="p-5 bg-sludge border border-acid/20 rounded clip-chamfer space-y-4">
                <h3 className="text-xs font-bold text-f0f0f0">// SALES_METRICS_TIMELINE</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.salesHistory}>
                      <CartesianGrid stroke="#151a15" />
                      <XAxis dataKey="_id" stroke="#cccccc" style={{ fontSize: '10px' }} />
                      <YAxis stroke="#cccccc" style={{ fontSize: '10px' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0c0a', border: '1px solid #39ff14', fontSize: '12px' }}
                        labelStyle={{ color: '#ffea00' }}
                      />
                      <Line type="monotone" dataKey="sales" stroke="#39ff14" strokeWidth={2} dot={{ fill: '#ffea00' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FULFILLMENT */}
          {activeTab === 'fulfillment' && (
            <div className="bg-sludge border border-acid/20 p-5 rounded clip-chamfer space-y-4 text-xs">
              <h3 className="text-xs font-bold text-f0f0f0">// ORDER_FULFILLMENT_KANBAN</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-acid/25 text-[10px] text-acid/80">
                      <th className="py-2">ORDER REF</th>
                      <th className="py-2">CUSTOMER</th>
                      <th className="py-2">TOTAL</th>
                      <th className="py-2">STATUS</th>
                      <th className="py-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id} className="border-b border-acid/10 hover:bg-void/40 transition-colors">
                        <td className="py-3 font-bold">{o.orderNumber}</td>
                        <td className="py-3">{o.user?.email || o.guestEmail}</td>
                        <td className="py-3 text-acid font-bold">${o.financials.total.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${o.fulfillmentStatus === 'Delivered' ? 'bg-acid/10 text-acid border border-acid/25' : 'bg-hazard/10 text-hazard border border-hazard/25'}`}>
                            {o.fulfillmentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <select
                            value={o.fulfillmentStatus}
                            onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                            className="bg-void border border-acid/30 px-2 py-1 rounded text-soft-ash outline-none"
                          >
                            <option value="Unfulfilled">UNFULFILLED</option>
                            <option value="Processing">PROCESSING</option>
                            <option value="Shipped">SHIPPED</option>
                            <option value="Delivered">DELIVERED</option>
                            <option value="Returned">RETURNED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SKU INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              
              {/* Product inventory list */}
              <div className="bg-sludge border border-acid/20 p-5 rounded clip-chamfer space-y-4 text-xs">
                <h3 className="text-xs font-bold text-f0f0f0">// SKU_STOCK_ALLOCATION</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-acid/25 text-[10px] text-acid/80">
                        <th className="py-2">SKU ID</th>
                        <th className="py-2">NAME</th>
                        <th className="py-2">CREDITS</th>
                        <th className="py-2">STOCK COUNT</th>
                        <th className="py-2 text-right">STOCK ADJUST</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const hasLowStock = p.inventory?.countInStock > 0 && p.inventory.countInStock <= (p.inventory.lowStockThreshold || 5);
                        return (
                          <tr key={p._id} className="border-b border-acid/10 hover:bg-void/40 transition-colors">
                            <td className="py-3 font-bold">{p.sku}</td>
                            <td className="py-3 font-sans">{p.name}</td>
                            <td className="py-3 text-acid font-bold">${p.price.toFixed(2)}</td>
                            <td className="py-3">
                              <span className={hasLowStock ? 'text-hazard font-bold animate-pulse' : ''}>
                                {p.inventory?.countInStock} UNIT(S)
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <input
                                type="number"
                                defaultValue={p.inventory?.countInStock}
                                onBlur={(e) => handleUpdateStock(p._id, e.target.value)}
                                className="w-20 bg-void border border-acid/30 px-2 py-1 rounded text-center outline-none"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bulk import tool */}
              <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer text-xs space-y-4">
                <h3 className="text-xs font-bold text-f0f0f0 flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-acid" />
                  BULK_INVENTORY_IMPORT (CSV_PAYLOAD)
                </h3>
                <form onSubmit={handleCSVImport} className="space-y-3">
                  <textarea
                    rows="6"
                    placeholder="sku,name,price,compareAtPrice,inventory.countInStock,categorySlug,description&#10;SKU-99,Hyper augmentation,120.00,,12,cybernetic-augments,A description"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    required
                    className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none font-mono text-[11px]"
                  />
                  
                  {importResult && <div className="text-acid font-bold text-[10px]">{importResult}</div>}
                  {importError && <div className="text-blaze font-bold text-[10px]">{importError}</div>}

                  <button 
                    type="submit" 
                    className="py-2 px-6 bg-acid text-void font-display font-black text-[10px] tracking-wider rounded shadow-acid"
                  >
                    TRANSMIT_CSV_LOAD
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 4: CMS CONFIGURATOR */}
          {activeTab === 'cms' && (
            <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer text-xs space-y-4">
              <h3 className="text-xs font-bold text-f0f0f0">// HOMEPAGE_CMS_UPLINK</h3>
              <form onSubmit={handleCMSUpdate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-acid/80 uppercase">Hero Banner Title</label>
                  <input 
                    type="text" 
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-acid/80 uppercase">Hero Banner Subtitle</label>
                  <input 
                    type="text" 
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-acid/80 uppercase">Hero CTA Text</label>
                  <input 
                    type="text" 
                    value={heroCtaText}
                    onChange={(e) => setHeroCtaText(e.target.value)}
                    className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-acid/80 uppercase">Featured Products IDs (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={featuredProds}
                    onChange={(e) => setFeaturedProds(e.target.value)}
                    placeholder="productId1, productId2"
                    className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                  />
                </div>

                {cmsSuccess && <div className="text-acid font-bold text-[10px]">{cmsSuccess}</div>}
                {cmsError && <div className="text-blaze font-bold text-[10px]">{cmsError}</div>}

                <button 
                  type="submit" 
                  className="py-2.5 px-6 bg-acid text-void font-display font-black text-[10px] tracking-widest rounded shadow-acid hover:bg-acid/85"
                >
                  COMMIT_CMS_CONFIGURATION
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: RUNNER REGISTRY (Superadmin only) */}
          {activeTab === 'users' && user.role === 'superadmin' && (
            <div className="space-y-6">
              
              {/* Header and Search */}
              <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer text-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-acid/15 pb-2">
                  <h3 className="text-xs font-bold text-f0f0f0 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-acid animate-pulse" />
                    RUNNER_IDENTITIES_REGISTRY
                  </h3>
                  
                  {/* Search filter input */}
                  <input
                    type="text"
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    placeholder="FILTER BY RUNNER NAME / EMAIL..."
                    className="bg-void border border-acid/30 px-3 py-1.5 rounded outline-none w-full sm:w-64 focus:border-acid"
                  />
                </div>

                {usersSuccess && <div className="p-2.5 border border-acid/40 bg-acid/5 text-[11px] text-acid font-bold rounded animate-pulse">{usersSuccess}</div>}
                {usersError && <div className="p-2.5 border border-blaze/40 bg-blaze/5 text-[11px] text-blaze font-bold rounded">{usersError}</div>}

                {/* Users List Grid Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-acid/25 text-[10px] text-acid/80">
                        <th className="py-2">RUNNER NAME</th>
                        <th className="py-2">EMAIL ADDRESS</th>
                        <th className="py-2">CLEARANCE ROLE</th>
                        <th className="py-2">JOINED</th>
                        <th className="py-2 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter((u) => {
                          const searchStr = usersSearch.toLowerCase();
                          const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
                          return fullName.includes(searchStr) || u.email.toLowerCase().includes(searchStr);
                        })
                        .map((u) => {
                          const isSelf = u._id === user._id;
                          // Role colors
                          const roleColors = {
                            superadmin: 'text-acid border-acid/30 bg-acid/5',
                            editor: 'text-hazard border-hazard/30 bg-hazard/5',
                            user: 'text-soft-ash/80 border-soft-ash/20 bg-soft-ash/5'
                          };
                          
                          return (
                            <tr key={u._id} className="border-b border-acid/10 hover:bg-void/40 transition-colors font-mono">
                              <td className="py-3 font-bold font-sans uppercase">
                                {u.firstName} {u.lastName} {isSelf && <span className="text-[9px] text-hazard ml-1">(YOU)</span>}
                              </td>
                              <td className="py-3 opacity-80">{u.email}</td>
                              <td className="py-3">
                                <span className={`text-[9px] border px-2 py-0.5 rounded font-bold uppercase ${roleColors[u.role] || roleColors.user}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3 opacity-60">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 text-right font-sans">
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  disabled={isSelf}
                                  className="text-blaze hover:text-blaze/70 disabled:opacity-30 disabled:pointer-events-none p-1.5 border border-blaze/20 hover:border-blaze rounded transition-all bg-void"
                                  title={isSelf ? "Self-deletion locked" : "Purge identity"}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
          </>
        )}
      </div>

    </div>
  );
}
