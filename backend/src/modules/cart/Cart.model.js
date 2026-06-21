import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({  
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },  
  quantity: { type: Number, required: true, min: 1 },  
  priceAtAdded: { type: Number, required: true } // Price lock at time of adding  
});

const cartSchema = new mongoose.Schema({  
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },  
  items: [cartItemSchema],  
  lastActive: { type: Date, default: Date.now }, // Used for abandoned cart cron jobs  
  abandonedEmailSent: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-update lastActive and reset email status on save  
cartSchema.pre('save', function(next) {  
  this.lastActive = Date.now();  
  this.abandonedEmailSent = false;  
  next();  
});

export default mongoose.model('Cart', cartSchema);
