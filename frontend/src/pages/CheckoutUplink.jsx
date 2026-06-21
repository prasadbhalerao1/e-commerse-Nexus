import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Terminal, ShieldCheck, CreditCard, Ticket, Check, RefreshCw } from 'lucide-react';

export default function CheckoutUplink() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Checkout Stages
  // 'input' -> customer enters shipping/billing info
  // 'establishing' -> establishes backend pricing/stock connection
  // 'encrypting' -> locks database and packages payload
  // 'transmitting' -> commits order record creation
  // 'success' -> transaction completed
  const [stage, setStage] = useState('input');
  const [orderResult, setOrderResult] = useState(null);

  // Address Inputs
  const [guestEmail, setGuestEmail] = useState('');
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');

  const [useSameBilling, setUseSameBilling] = useState(true);
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [billingCountry, setBillingCountry] = useState('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  // Coupon promo state
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [checkoutError, setCheckoutError] = useState('');

  // Load default user address if available
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setShippingStreet(defAddr.street);
      setShippingCity(defAddr.city);
      setShippingState(defAddr.state);
      setShippingZip(defAddr.zip);
      setShippingCountry(defAddr.country);
    }
  }, [user]);

  // Price calculations
  const subtotal = getCartTotal();
  
  let discountAmount = 0;
  if (activeCoupon) {
    if (activeCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * activeCoupon.discountValue) / 100;
    } else {
      discountAmount = activeCoupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const tax = (subtotal - discountAmount) * 0.08;
  const shippingCost = subtotal > 150 ? 0 : 10;
  const total = subtotal - discountAmount + tax + shippingCost;

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const response = await fetch(`/api/coupons/validate?code=${couponCode.toUpperCase()}&orderValue=${subtotal}`);
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'Invalid coupon');
      }

      setActiveCoupon(body.data.coupon);
      setCouponSuccess(`PROMO APPLIED: $${body.data.coupon.discountValue}${body.data.coupon.discountType === 'percentage' ? '%' : ''} OFF`);
    } catch (err) {
      setActiveCoupon(null);
      setCouponError(err.message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setCheckoutError('');

    // Setup Billing inputs
    const finalBillingStreet = useSameBilling ? shippingStreet : billingStreet;
    const finalBillingCity = useSameBilling ? shippingCity : billingCity;
    const finalBillingState = useSameBilling ? shippingState : billingState;
    const finalBillingZip = useSameBilling ? shippingZip : billingZip;
    const finalBillingCountry = useSameBilling ? shippingCountry : billingCountry;

    // Sequence through cyberpunk connection stages
    setStage('establishing');
    
    setTimeout(() => {
      setStage('encrypting');
      
      setTimeout(async () => {
        setStage('transmitting');
        
        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guestEmail: user ? undefined : guestEmail,
              items: cartItems.map((item) => ({
                product: item.product,
                qty: item.quantity
              })),
              shippingAddress: {
                street: shippingStreet,
                city: shippingCity,
                state: shippingState,
                zip: shippingZip,
                country: shippingCountry
              },
              billingAddress: {
                street: finalBillingStreet,
                city: finalBillingCity,
                state: finalBillingState,
                zip: finalBillingZip,
                country: finalBillingCountry
              },
              paymentMethod,
              couponCode: activeCoupon ? activeCoupon.code : null
            })
          });

          const body = await response.json();
          if (!response.ok) {
            throw new Error(body.message || 'Checkout failed');
          }

          setOrderResult(body.data.order);
          clearCart();
          setStage('success');
        } catch (err) {
          setCheckoutError(err.message);
          setStage('input');
        }

      }, 1500);

    }, 1500);
  };

  if (cartItems.length === 0 && stage !== 'success') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center font-mono text-soft-ash space-y-4">
        <p>// NO ITEMS DETECTED IN ACTIVE CARGO CORES</p>
        <Link to="/catalog" className="text-acid hover:underline font-bold">// INITIALIZE CATALOG</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-mono text-soft-ash">
      
      {/* Page Title */}
      <div className="flex items-center gap-3 border-b border-acid/20 pb-4 mb-8">
        <Terminal className="h-6 w-6 text-acid animate-pulse" />
        <h2 className="font-display font-black text-xl tracking-widest text-acid">
          MAINFRAME_CHECKOUT_UPLINK
        </h2>
      </div>

      {stage === 'input' && (
        <form onSubmit={handleCheckoutSubmit} className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Side: Shipping / Billing Forms */}
          <div className="flex-grow space-y-6">
            
            {/* Identity enclave */}
            {!user && (
              <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer text-xs space-y-3">
                <h3 className="text-xs font-bold text-f0f0f0 border-b border-acid/15 pb-2">// GUEST_IDENTITY</h3>
                <div className="space-y-1">
                  <label className="text-[9px] text-acid/80 uppercase">Guest email address (REQUIRED)</label>
                  <input 
                    type="email" 
                    value={guestEmail} 
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    placeholder="guest@nexus.io"
                    className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                  />
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer text-xs space-y-4">
              <h3 className="text-xs font-bold text-f0f0f0 border-b border-acid/15 pb-2">// DESTINATION_UPLINK_ADDRESS</h3>
              
              <div className="space-y-1">
                <label className="text-[9px] text-acid/80 uppercase">Street Address</label>
                <input 
                  type="text" 
                  value={shippingStreet}
                  onChange={(e) => setShippingStreet(e.target.value)}
                  required
                  placeholder="221B NEON DRIVE"
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-acid/80 uppercase">City</label>
                  <input 
                    type="text" 
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    required
                    placeholder="CYBERCITY"
                    className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-acid/80 uppercase">State / Province</label>
                  <input 
                    type="text" 
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    required
                    placeholder="SECTOR 7"
                    className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-acid/80 uppercase">Zip / Postal Code</label>
                  <input 
                    type="text" 
                    value={shippingZip}
                    onChange={(e) => setShippingZip(e.target.value)}
                    required
                    placeholder="000101"
                    className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-acid/80 uppercase">Country</label>
                  <input 
                    type="text" 
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                    required
                    placeholder="NEOTERRA"
                    className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address Toggle */}
            <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer text-xs space-y-4">
              <h3 className="text-xs font-bold text-f0f0f0 border-b border-acid/15 pb-2">// BILLING_UPLINK_ADDRESS</h3>
              <label className="flex items-center gap-2 text-[10px] text-soft-ash/80 cursor-none select-none">
                <input 
                  type="checkbox" 
                  checked={useSameBilling}
                  onChange={(e) => setUseSameBilling(e.target.checked)}
                  className="bg-void border border-acid/30 rounded text-acid"
                />
                BILL TO SAME DESTINATION ADDRESS
              </label>

              {!useSameBilling && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-acid/80 uppercase">Street Address</label>
                    <input 
                      type="text" 
                      value={billingStreet}
                      onChange={(e) => setBillingStreet(e.target.value)}
                      required
                      placeholder="STREET DETAILS"
                      className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="CITY" 
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      required
                      className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="STATE" 
                      value={billingState}
                      onChange={(e) => setBillingState(e.target.value)}
                      required
                      className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="ZIP" 
                      value={billingZip}
                      onChange={(e) => setBillingZip(e.target.value)}
                      required
                      className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="COUNTRY" 
                      value={billingCountry}
                      onChange={(e) => setBillingCountry(e.target.value)}
                      required
                      className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer text-xs space-y-3">
              <h3 className="text-xs font-bold text-f0f0f0 border-b border-acid/15 pb-2 flex items-center gap-1">
                <CreditCard className="h-4 w-4 text-acid" />
                TRANSMISSION_METHODS
              </h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 p-3 border border-acid/35 rounded bg-void hover:border-acid cursor-none select-none text-[11px] w-1/2">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="PayPal" 
                    checked={paymentMethod === 'PayPal'}
                    onChange={() => setPaymentMethod('PayPal')}
                  />
                  PAYPAL UPLINK
                </label>
                <label className="flex items-center gap-2 p-3 border border-acid/35 rounded bg-void hover:border-acid cursor-none select-none text-[11px] w-1/2">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="Stripe" 
                    checked={paymentMethod === 'Stripe'}
                    onChange={() => setPaymentMethod('Stripe')}
                  />
                  STRIPE Elements
                </label>
              </div>
            </div>

          </div>

          {/* Right Side: Order summary & coupon validations */}
          <div className="w-full lg:w-96 shrink-0 space-y-6">
            
            {/* Cargo Content Summary */}
            <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer text-xs space-y-4">
              <h3 className="text-xs font-bold text-f0f0f0 border-b border-acid/15 pb-2">// CARGO_SUMMARY</h3>
              
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {cartItems.map((item) => (
                  <div key={item.product} className="flex justify-between text-[11px]">
                    <span className="line-clamp-1">{item.name.toUpperCase()} (x{item.quantity})</span>
                    <span className="font-bold text-acid shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="border-t border-acid/15 pt-4 space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input 
                      type="text" 
                      placeholder="COUPON_CODE" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={activeCoupon}
                      className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none"
                    />
                    <Ticket className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-soft-ash/40" />
                  </div>
                  {activeCoupon ? (
                    <button 
                      type="button" 
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 border border-blaze text-blaze hover:bg-blaze/15 rounded"
                    >
                      CLEAR
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleValidateCoupon}
                      disabled={validatingCoupon || !couponCode}
                      className="px-3 py-2 border border-acid text-acid hover:bg-acid/15 rounded disabled:opacity-40"
                    >
                      APPLY
                    </button>
                  )}
                </div>

                {couponError && <div className="text-blaze text-[10px] font-bold">{couponError}</div>}
                {couponSuccess && <div className="text-acid text-[10px] font-bold">{couponSuccess}</div>}
              </div>

              {/* Totals Table */}
              <div className="border-t border-acid/15 pt-4 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span>SUBTOTAL:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[11px] text-hazard">
                    <span>DISCOUNT:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px]">
                  <span>ESTIMATED TAX (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>SHIPPING:</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-acid border-t border-acid/10 pt-2">
                  <span>GRAND_TOTAL:</span>
                  <span className="font-arcade text-acid">${total.toFixed(2)}</span>
                </div>
              </div>

              {checkoutError && <div className="p-2 border border-blaze/40 bg-blaze/5 text-[11px] text-blaze font-bold rounded">{checkoutError}</div>}

              <button 
                type="submit" 
                className="w-full py-3 mt-2 bg-blaze text-void font-display font-black tracking-widest text-xs rounded shadow-blaze hover:shadow-blaze-intense"
              >
                TRANSMIT_ORDER_PAYLOAD
              </button>

            </div>

          </div>

        </form>
      )}

      {/* Cybernetic terminal connection stage transitions */}
      {stage !== 'input' && stage !== 'success' && (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-6 text-center">
          <RefreshCw className="h-8 w-8 text-acid animate-spin" />
          
          <div className="font-mono text-sm space-y-2 uppercase">
            <p className={stage === 'establishing' ? 'text-acid font-bold' : 'opacity-40'}>
              &gt; Establishing secure connection to mainframe uplink...
            </p>
            <p className={stage === 'encrypting' ? 'text-hazard font-bold animate-pulse' : 'opacity-40'}>
              &gt; Encrypting checkout payload data structures...
            </p>
            <p className={stage === 'transmitting' ? 'text-blaze font-bold animate-ping' : 'opacity-40'}>
              &gt; Transmitting transaction funds through security enclave...
            </p>
          </div>
        </div>
      )}

      {/* Checkout Success Screen */}
      {stage === 'success' && orderResult && (
        <div className="min-h-[400px] flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
          <div className="h-12 w-12 rounded-full border-2 border-acid flex items-center justify-center shadow-acid bg-acid/5">
            <Check className="h-6 w-6 text-acid" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-black text-xl text-acid hover-glitch">UPLINK_TRANSMISSION_COMPLETE</h3>
            <p className="text-xs text-soft-ash/80">
              Your order payload has been verified and registered on the secure node.
            </p>
          </div>

          <div className="w-full p-4 bg-sludge border border-acid/15 rounded text-left text-xs space-y-2">
            <p><span className="opacity-55">ORDER REF:</span> <span className="font-bold text-f0f0f0">{orderResult.orderNumber}</span></p>
            <p><span className="opacity-55">FUNDS CHARGED:</span> <span className="font-arcade text-acid">${orderResult.financials?.total?.toFixed(2)}</span></p>
            <p><span className="opacity-55">STATUS:</span> <span className="text-hazard">UNFULFILLED // COMPLETED</span></p>
          </div>

          <div className="flex gap-4">
            <Link 
              to="/profile" 
              className="px-4 py-2 border border-acid text-acid hover:bg-acid/15 text-xs font-bold rounded"
            >
              TRACK_ORDER
            </Link>
            <Link 
              to="/catalog" 
              className="px-4 py-2 bg-acid text-void text-xs font-display font-black tracking-wider rounded"
            >
              CONTINUE
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
