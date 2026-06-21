import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({  
  street: { type: String, required: true },  
  city: { type: String, required: true },  
  state: { type: String, required: true },  
  zip: { type: String, required: true },  
  country: { type: String, required: true },  
  isDefault: { type: Boolean, default: false }  
});

const userSchema = new mongoose.Schema({  
  firstName: { type: String, required: true, trim: true },  
  lastName: { type: String, required: true, trim: true },  
  email: { type: String, required: true, unique: true, index: true, lowercase: true },  
  password: { type: String, required: true, select: false }, // Hidden by default  
  role: {   
    type: String,   
    enum: ['user', 'editor', 'superadmin'],   
    default: 'user'   
  },  
  addresses: [addressSchema],  
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],  
  stripeCustomerId: { type: String } // Placeholder
}, { timestamps: true });

export default mongoose.model('User', userSchema);
