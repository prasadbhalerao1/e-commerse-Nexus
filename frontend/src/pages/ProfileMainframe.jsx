import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Terminal, MapPin, ClipboardList, Plus, Trash2, FileDown, CheckCircle2 } from 'lucide-react';

export default function ProfileMainframe() {
  const { user, refreshUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address Form States
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState('');
  const [addressError, setAddressError] = useState('');

  // Profile Edit States
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const fetchMyOrders = async () => {
    try {
      const response = await fetch('/api/orders/my');
      if (response.ok) {
        const body = await response.json();
        setOrders(body.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName })
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'Profile update failed');
      }

      setProfileSuccess('PROFILE_UPDATED_SUCCESSFULLY');
      refreshUser();
    } catch (err) {
      setProfileError(err.message);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    setAddressSuccess('');

    try {
      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ street, city, state, zip, country, isDefault })
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'Failed to register address');
      }

      setAddressSuccess('NEW_ADDRESS_LOGGED');
      setStreet('');
      setCity('');
      setState('');
      setZip('');
      setCountry('');
      setIsDefault(false);
      refreshUser();
    } catch (err) {
      setAddressError(err.message);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await fetch(`/api/users/addresses/${addressId}`, { method: 'DELETE' });
      if (response.ok) {
        refreshUser();
      }
    } catch (err) {
      console.error('Address delete failure:', err);
    }
  };

  const handleDownloadInvoice = async (orderId, orderNum) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderNum}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error('Invoice download failed:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center font-mono text-soft-ash">
        <p>// ACCESS DENIED. INITIALIZE UPLINK FOR CREDENTIALS VALIDATION</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-mono text-soft-ash space-y-10">
      
      {/* Page Title */}
      <div className="flex items-center gap-3 border-b border-acid/20 pb-4 mb-8">
        <Terminal className="h-6 w-6 text-acid animate-pulse" />
        <h2 className="font-display font-black text-xl tracking-widest text-acid">
          RUNNER_PROFILE_MAINFRAME
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Profile Credentials & Addresses Book */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Credentials Box */}
          <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer text-xs space-y-4">
            <h3 className="text-xs font-bold text-f0f0f0 border-b border-acid/15 pb-2">// IDENTITY_CREDENTIALS</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] text-acid/80 uppercase">First_Name</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-acid/80 uppercase">Last_Name</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-acid/80 uppercase">System_Email</label>
                <input 
                  type="text" 
                  value={user.email} 
                  disabled
                  className="w-full bg-void border border-acid/10 px-3 py-2 rounded text-f0f0f0/50 outline-none"
                />
              </div>

              {profileError && <div className="text-blaze font-bold text-[10px]">{profileError}</div>}
              {profileSuccess && <div className="text-acid font-bold text-[10px]">{profileSuccess}</div>}

              <button 
                type="submit" 
                className="w-full py-2 bg-acid text-void font-display font-black text-[10px] tracking-wider rounded shadow-acid hover:bg-acid/80"
              >
                UPDATE_CREDENTIALS
              </button>
            </form>
          </div>

          {/* Address Book Manager */}
          <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer text-xs space-y-4">
            <h3 className="text-xs font-bold text-f0f0f0 border-b border-acid/15 pb-2 flex items-center gap-1">
              <MapPin className="h-4 w-4 text-acid" />
              SHIPPING_ADDRESS_BOOK
            </h3>

            {/* Address List */}
            {user.addresses && user.addresses.length > 0 ? (
              <div className="space-y-2">
                {user.addresses.map((addr) => (
                  <div key={addr._id} className="p-3 bg-void border border-acid/15 rounded flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-sans text-[11px] text-soft-ash">{addr.street}</p>
                      <p className="font-sans text-[10px] text-soft-ash/60">{addr.city}, {addr.state} {addr.zip}</p>
                      <p className="font-sans text-[10px] text-soft-ash/60">{addr.country.toUpperCase()}</p>
                      {addr.isDefault && (
                        <span className="inline-block text-[8px] text-acid border border-acid/20 px-1 py-0.5 rounded bg-acid/5">DEFAULT</span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-blaze hover:text-blaze/70 p-1 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-soft-ash/50 text-center">// NO SHIPPING DESTINATIONS RECORDED</p>
            )}

            {/* Address Form */}
            <form onSubmit={handleAddAddress} className="border-t border-acid/15 pt-4 space-y-3">
              <span className="text-[9px] text-acid/80">// ADD_NEW_DESTINATION</span>
              <input 
                type="text" 
                placeholder="STREET ADDRESS" 
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="CITY" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                />
                <input 
                  type="text" 
                  placeholder="STATE / PROV" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="ZIP / POSTAL" 
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                />
                <input 
                  type="text" 
                  placeholder="COUNTRY" 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                />
              </div>
              <label className="flex items-center gap-2 text-[10px] text-soft-ash/80 cursor-none select-none">
                <input 
                  type="checkbox" 
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="bg-void border border-acid/30 rounded text-acid"
                />
                SET AS DEFAULT DESTINATION
              </label>

              {addressError && <div className="text-blaze font-bold text-[10px]">{addressError}</div>}
              {addressSuccess && <div className="text-acid font-bold text-[10px]">{addressSuccess}</div>}

              <button 
                type="submit" 
                className="w-full py-2 border border-acid text-acid hover:bg-acid/15 font-display font-black text-[10px] tracking-wider rounded"
              >
                ADD_ADDRESS
              </button>
            </form>

          </div>

        </div>

        {/* Right Side: Past Orders timeline history list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer text-xs space-y-4">
            <h3 className="text-xs font-bold text-f0f0f0 border-b border-acid/15 pb-2 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-acid" />
              ACQUISITIONS_TIMELINE
            </h3>

            {loadingOrders ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-void/50 border border-acid/10 rounded animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 border border-acid/10 rounded text-center text-soft-ash/40">
                // NO PAST ACQUISITIONS DETECTED ON USER HASH
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order._id} 
                    className="p-4 bg-void border border-acid/15 hover:border-acid/40 rounded flex flex-col sm:flex-row justify-between gap-4 transition-colors"
                  >
                    {/* Meta details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-f0f0f0">{order.orderNumber}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-acid/5 border border-acid/20 text-acid">
                          {order.fulfillmentStatus.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-soft-ash/60">
                        COMMITTED: {new Date(order.createdAt).toLocaleDateString()} // ITEMS: {order.items.reduce((acc, it) => acc + it.qty, 0)}
                      </p>
                      
                      {/* Products preview */}
                      <div className="flex gap-2 pt-1">
                        {order.items.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="text-[10px] bg-sludge px-2 py-0.5 border border-acid/10 rounded"
                          >
                            {item.name.toUpperCase()} (x{item.qty})
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial totals and Invoice download */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className="text-sm font-arcade text-acid">${order.financials.total.toFixed(2)}</span>
                      
                      <button 
                        onClick={() => handleDownloadInvoice(order._id, order.orderNumber)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-acid/10 hover:bg-acid text-acid hover:text-void border border-acid/30 text-[10px] rounded transition-all font-mono"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        INVOICE
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
