import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({  
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },  
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },  
  discountValue: { type: Number, required: true }, // e.g., 20 for 20%, or 15 for $15 off  
  minOrderValue: { type: Number, default: 0 },  
  usageLimit: { type: Number, default: null }, // Null means unlimited  
  timesUsed: { type: Number, default: 0 },  
  expiresAt: { type: Date, required: true },  
  isActive: { type: Boolean, default: true }  
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
