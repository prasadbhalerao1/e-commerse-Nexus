import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({  
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },  
  name: { type: String, required: true },  
  sku: { type: String, required: true },  
  qty: { type: Number, required: true, min: 1 },  
  priceAtPurchase: { type: Number, required: true }  
});

const orderSchema = new mongoose.Schema({  
  orderNumber: { type: String, required: true, unique: true, index: true },  
    
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null for Guests  
  guestEmail: { type: String }, // Required if user is null  
    
  items: [orderItemSchema],  
    
  shippingAddress: {  
    street: String, city: String, state: String, zip: String, country: String  
  },  
  billingAddress: {  
    street: String, city: String, state: String, zip: String, country: String  
  },  
    
  payment: {  
    method: { type: String, enum: ['Stripe', 'PayPal'], required: true },  
    transactionId: { type: String },  
    status: {   
      type: String,   
      enum: ['Pending', 'Authorized', 'Completed', 'Failed', 'Refunded'],   
      default: 'Pending'   
    }  
  },  
    
  financials: {  
    subtotal: { type: Number, required: true },  
    tax: { type: Number, required: true },  
    shippingCost: { type: Number, required: true },  
    discountAmount: { type: Number, default: 0 },  
    total: { type: Number, required: true }  
  },  
    
  fulfillmentStatus: {   
    type: String,   
    enum: ['Unfulfilled', 'Processing', 'Shipped', 'Delivered', 'Returned', 'Canceled'],   
    default: 'Unfulfilled'   
  },  
  trackingNumber: { type: String },  
    
  appliedCoupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null }  
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
