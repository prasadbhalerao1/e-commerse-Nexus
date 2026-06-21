import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/users/User.model.js';
import Category from './src/modules/products/Category.model.js';
import Product from './src/modules/products/Product.model.js';
import CMS from './src/modules/cms/CMS.model.js';
import Coupon from './src/modules/coupons/Coupon.model.js';
import Cart from './src/modules/cart/Cart.model.js';
import Order from './src/modules/orders/Order.model.js';
import Review from './src/modules/reviews/Review.model.js';
import { hashPassword } from './src/core/security/bcrypt.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecom-nexus';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected.');

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Cart.deleteMany({});
    await CMS.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing collections.');

    // Password hash (shared)
    const password = await hashPassword('password123');
    
    // Seed default administrative users
    const superadmin = await User.create({
      firstName: 'Neo',
      lastName: 'Superadmin',
      email: 'admin@nexus.io',
      password,
      role: 'superadmin'
    });

    const editor = await User.create({
      firstName: 'Trinity',
      lastName: 'Editor',
      email: 'editor@nexus.io',
      password,
      role: 'editor'
    });

    // Seed test@example.com (Test user with extensive edge case records)
    const testUser = await User.create({
      firstName: 'Morpheus',
      lastName: 'Tester',
      email: 'test@example.com',
      password,
      role: 'user',
      addresses: [
        {
          street: '101 Cyber Expressway, Room 404',
          city: 'Neotropolis',
          state: 'Sector 9',
          zip: '99021',
          country: 'Neoterra',
          isDefault: true // Default Shipping address
        },
        {
          street: '77 Mainframe Uplink Road',
          city: 'Neotropolis',
          state: 'Sector 9',
          zip: '99022',
          country: 'Neoterra',
          isDefault: false // Billing / Alternate address
        }
      ]
    });

    console.log('Users seeded:');
    console.log('- Superadmin: admin@nexus.io (pwd: password123)');
    console.log('- Editor: editor@nexus.io (pwd: password123)');
    console.log('- Test User: test@example.com (pwd: password123)');

    // Seed Categories
    const cyberware = await Category.create({
      name: 'Cybernetic Augments',
      slug: 'cybernetic-augments',
      description: 'Physical augmentations to enhance data throughput.'
    });

    const decks = await Category.create({
      name: 'Cyber Decks',
      slug: 'cyber-decks',
      description: 'Heavy duty hacker decks running radioactive payloads.'
    });

    const sludge = await Category.create({
      name: 'Radioactive Waste',
      slug: 'radioactive-waste',
      description: 'Pure neon chemicals for reactor cores.'
    });

    console.log('Categories seeded.');

    // Seed Products (including local generated assets and stock edge cases)
    const p1 = await Product.create({
      sku: 'NEX-AUG-GLOW',
      name: 'Ocular Bio-Lens (Acid Glow)',
      slug: 'ocular-bio-lens-acid-glow',
      description: 'Superimpose real-time terminal telemetry directly onto your retina. Emits Acid Green radiation. Built for terminal deck runners.',
      price: 249.99,
      compareAtPrice: 299.99,
      inventory: { countInStock: 8, lowStockThreshold: 3 },
      category: cyberware._id,
      tags: ['cyberpunk', 'glow', 'augment', 'acid-green'],
      images: [
        { url: '/cyber_lens.png', altText: 'Acid Bio-Lens Primary', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300', altText: 'Acid Bio-Lens Angle' }
      ]
    });

    const p2 = await Product.create({
      sku: 'NEX-DEC-SLUDGE',
      name: 'Abyssal Sludge Hacking Rig',
      slug: 'abyssal-sludge-hacking-rig',
      description: 'Handheld modular cyber-deck. Framed in military-grade polymer with Abyssal Sludge finish. Powered by dual plutonium batteries.',
      price: 1250.00,
      inventory: { countInStock: 2, lowStockThreshold: 1 }, // Critical stock count
      category: decks._id,
      tags: ['cyberpunk', 'deck', 'rig', 'sludge'],
      images: [
        { url: '/cyber_deck.png', altText: 'Abyssal Sludge Rig Primary', isPrimary: true }
      ]
    });

    const p3 = await Product.create({
      sku: 'NEX-WST-NEON',
      name: 'Liquid Reactor Fuel (Hazard Yellow)',
      slug: 'liquid-reactor-fuel-hazard-yellow',
      description: 'Highly concentrated coolant fluid for heavy computing cores. Flashes bright Hazard Yellow under UV exposure. Extreme thermal dissipation.',
      price: 89.50,
      compareAtPrice: 110.00,
      inventory: { countInStock: 45, lowStockThreshold: 10 },
      category: sludge._id,
      tags: ['coolant', 'reactor', 'yellow', 'hazard'],
      images: [
        { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300', altText: 'Hazard Yellow Coolant', isPrimary: true }
      ]
    });

    // EDGE CASE PRODUCT: Out of stock item
    const p4 = await Product.create({
      sku: 'NEX-WST-DECAY',
      name: 'Decayed Reactor Rod (Out of Stock)',
      slug: 'decayed-reactor-rod-out-of-stock',
      description: 'Pruned fuel rods containing spent plutonium cores. Emits zero energy and is fully depleted of charge.',
      price: 15.00,
      inventory: { countInStock: 0, lowStockThreshold: 2 }, // Out of stock
      category: sludge._id,
      tags: ['spent', 'decayed', 'trash'],
      images: [
        { url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300', altText: 'Depleted fuel rod', isPrimary: true }
      ]
    });

    // EDGE CASE PRODUCT: Soft-deleted/Inactive item
    const p5 = await Product.create({
      sku: 'NEX-RIG-ARCHIVED',
      name: 'Archived Quantum Rig (Inactive)',
      slug: 'archived-quantum-rig-inactive',
      description: 'Legacy hacker terminal archived in mainframe cores. Invisible in catalog but may exist in older cart sessions.',
      price: 4500.00,
      inventory: { countInStock: 1, lowStockThreshold: 1 },
      category: decks._id,
      tags: ['quantum', 'legacy', 'archived'],
      images: [
        { url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=300', altText: 'Archived Quantum Rig', isPrimary: true }
      ],
      isActive: false // Inactive product
    });

    console.log('Products seeded.');

    // Seed testUser Cart with active, out of stock, and inactive items
    await Cart.create({
      user: testUser._id,
      items: [
        { product: p1._id, quantity: 2, priceAtAdded: p1.price }, // Active
        { product: p2._id, quantity: 1, priceAtAdded: p2.price }, // Active (Low Stock)
        { product: p4._id, quantity: 1, priceAtAdded: p4.price }, // Out of stock edge case
        { product: p5._id, quantity: 1, priceAtAdded: p5.price }  // Inactive product edge case
      ]
    });

    // Also seed empty carts for administrative users
    await Cart.create({ user: superadmin._id, items: [] });
    await Cart.create({ user: editor._id, items: [] });
    console.log('User Carts seeded.');

    // Seed Coupons (including edge case conditions)
    await Coupon.create({
      code: 'NEXUS20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days active
    });

    await Coupon.create({
      code: 'HAZARD50',
      discountType: 'fixed',
      discountValue: 50,
      minOrderValue: 200,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days active
    });

    // EDGE CASE: Expired Coupon
    await Coupon.create({
      code: 'NEXUS-EXPIRED',
      discountType: 'percentage',
      discountValue: 15,
      minOrderValue: 50,
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Expired 5 days ago
    });

    // EDGE CASE: Usage Limit Met Coupon
    await Coupon.create({
      code: 'NEXUS-MAX',
      discountType: 'fixed',
      discountValue: 100,
      minOrderValue: 150,
      usageLimit: 10,
      timesUsed: 10, // Max limits reached
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    });

    // EDGE CASE: High Spend Minimum Coupon
    await Coupon.create({
      code: 'NEXUS-RICH',
      discountType: 'fixed',
      discountValue: 300,
      minOrderValue: 1000, // Needs 1000 minimum spend
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    console.log('Coupons seeded.');

    // Seed past orders history for testUser (Order timeline and status checking)
    // Order 1: Completed & Delivered (allows Verified review)
    const o1 = await Order.create({
      orderNumber: `NEX-${Date.now() - 500000}-01`,
      user: testUser._id,
      items: [
        { product: p1._id, name: p1.name, qty: 1, priceAtPurchase: p1.price, sku: p1.sku }
      ],
      shippingAddress: testUser.addresses[0],
      billingAddress: testUser.addresses[0],
      payment: {
        method: 'Stripe',
        transactionId: `TX-MOCK-9801`,
        status: 'Completed'
      },
      financials: {
        subtotal: p1.price,
        tax: p1.price * 0.08,
        shippingCost: 10,
        discountAmount: 0,
        total: p1.price * 1.08 + 10
      },
      fulfillmentStatus: 'Delivered',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    });

    // Order 2: Completed & Shipped (contains tracking number)
    await Order.create({
      orderNumber: `NEX-${Date.now() - 400000}-02`,
      user: testUser._id,
      items: [
        { product: p3._id, name: p3.name, qty: 2, priceAtPurchase: p3.price, sku: p3.sku }
      ],
      shippingAddress: testUser.addresses[0],
      billingAddress: testUser.addresses[0],
      payment: {
        method: 'PayPal',
        transactionId: `TX-MOCK-9802`,
        status: 'Completed'
      },
      financials: {
        subtotal: p3.price * 2,
        tax: (p3.price * 2) * 0.08,
        shippingCost: 0, // Free above $150
        discountAmount: 0,
        total: (p3.price * 2) * 1.08
      },
      fulfillmentStatus: 'Shipped',
      trackingNumber: 'TRK-NEX-882901',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    });

    // Order 3: Completed & Processing
    await Order.create({
      orderNumber: `NEX-${Date.now() - 300000}-03`,
      user: testUser._id,
      items: [
        { product: p2._id, name: p2.name, qty: 1, priceAtPurchase: p2.price, sku: p2.sku }
      ],
      shippingAddress: testUser.addresses[0],
      billingAddress: testUser.addresses[0],
      payment: {
        method: 'Stripe',
        transactionId: `TX-MOCK-9803`,
        status: 'Completed'
      },
      financials: {
        subtotal: p2.price,
        tax: p2.price * 0.08,
        shippingCost: 0,
        discountAmount: 0,
        total: p2.price * 1.08
      },
      fulfillmentStatus: 'Processing',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    });

    // Order 4: Pending & Unfulfilled
    await Order.create({
      orderNumber: `NEX-${Date.now() - 200000}-04`,
      user: testUser._id,
      items: [
        { product: p3._id, name: p3.name, qty: 1, priceAtPurchase: p3.price, sku: p3.sku }
      ],
      shippingAddress: testUser.addresses[0],
      billingAddress: testUser.addresses[1], // Billing address different
      payment: {
        method: 'PayPal',
        transactionId: `TX-MOCK-9804`,
        status: 'Pending'
      },
      financials: {
        subtotal: p3.price,
        tax: p3.price * 0.08,
        shippingCost: 10,
        discountAmount: 0,
        total: p3.price * 1.08 + 10
      },
      fulfillmentStatus: 'Unfulfilled',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    });

    // Order 5: Failed & Returned / Refunded
    await Order.create({
      orderNumber: `NEX-${Date.now() - 100000}-05`,
      user: testUser._id,
      items: [
        { product: p1._id, name: p1.name, qty: 1, priceAtPurchase: p1.price, sku: p1.sku }
      ],
      shippingAddress: testUser.addresses[0],
      billingAddress: testUser.addresses[0],
      payment: {
        method: 'Stripe',
        transactionId: `TX-MOCK-9805`,
        status: 'Refunded'
      },
      financials: {
        subtotal: p1.price,
        tax: p1.price * 0.08,
        shippingCost: 10,
        discountAmount: 0,
        total: p1.price * 1.08 + 10
      },
      fulfillmentStatus: 'Returned',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    });

    // Order 6: Guest Checkout (user is null, guestEmail is set)
    await Order.create({
      orderNumber: `NEX-${Date.now() - 50000}-06`,
      user: null,
      guestEmail: 'guest_runner@nexus.io',
      items: [
        { product: p3._id, name: p3.name, qty: 1, priceAtPurchase: p3.price, sku: p3.sku }
      ],
      shippingAddress: {
        street: '404 Grid Pipeline, Block B',
        city: 'Neotropolis',
        state: 'Sector 4',
        zip: '99031',
        country: 'Neoterra'
      },
      billingAddress: {
        street: '404 Grid Pipeline, Block B',
        city: 'Neotropolis',
        state: 'Sector 4',
        zip: '99031',
        country: 'Neoterra'
      },
      payment: {
        method: 'Stripe',
        transactionId: `TX-MOCK-9806`,
        status: 'Completed'
      },
      financials: {
        subtotal: p3.price,
        tax: p3.price * 0.08,
        shippingCost: 10,
        discountAmount: 0,
        total: p3.price * 1.08 + 10
      },
      fulfillmentStatus: 'Unfulfilled',
      createdAt: new Date(Date.now() - 6 * 1000 * 60 * 60) // 6 hours ago
    });

    console.log('Past Orders history timeline seeded.');

    // Seed Reviews
    // Review 1: testUser posts review on Ocular Bio-Lens (VERIFIED purchase, since Order 1 is Delivered)
    await Review.create({
      product: p1._id,
      user: testUser._id,
      rating: 5,
      title: 'Flawless Interface',
      comment: 'Retinal rendering throughput is exceptionally high. Perfect Acid Green glow overlays.',
      images: ['https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=300'],
      isVerifiedPurchase: true
    });

    // Review 2: Superadmin posts review on Ocular Bio-Lens (NON-VERIFIED purchase)
    await Review.create({
      product: p1._id,
      user: superadmin._id,
      rating: 4,
      title: 'Stable Augment',
      comment: 'Standard optic calibrations work fine. Highly recommend for tactical runs.',
      images: [],
      isVerifiedPurchase: false
    });

    // Recalculate averageRating on Ocular Bio-Lens atomically
    p1.reviews.totalReviews = 2;
    p1.reviews.averageRating = 4.5;
    await p1.save();

    console.log('Reviews seeded.');

    // Seed CMS homepage configurations
    await CMS.create({
      key: 'homepage',
      heroBanner: {
        title: 'PROJECT NEXUS // DIRECT UPLINK',
        subtitle: 'Secure radioactive waste, hacking rigs, and synaptic cyber-augments.',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800',
        ctaText: 'INITIALIZE DIRECTORY'
      },
      featuredProducts: [p1._id, p3._id]
    });
    console.log('CMS configurations seeded.');

    console.log('Seeding complete. Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
