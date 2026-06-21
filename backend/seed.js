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

    // Seed other standard users to populate orders history
    const buyer = await User.create({
      firstName: 'Apoc',
      lastName: 'Buyer',
      email: 'buyer@nexus.io',
      password,
      role: 'user',
      addresses: [
        {
          street: '88 Zion Core Drive',
          city: 'Zion City',
          state: 'Deep Subterranean',
          zip: '00001',
          country: 'FreeEarth',
          isDefault: true
        }
      ]
    });

    const traitor = await User.create({
      firstName: 'Cypher',
      lastName: 'Traitor',
      email: 'traitor@nexus.io',
      password,
      role: 'user',
      addresses: [
        {
          street: 'Matrix Luxury Suite 10',
          city: 'MegaCity',
          state: 'Simulation Grid',
          zip: '88201',
          country: 'SimulatedUSA',
          isDefault: true
        }
      ]
    });

    console.log('Users seeded:');
    console.log('- Superadmin: admin@nexus.io (pwd: password123)');
    console.log('- Editor: editor@nexus.io (pwd: password123)');
    console.log('- Test User: test@example.com (pwd: password123)');
    console.log('- Standard Buyer: buyer@nexus.io (pwd: password123)');
    console.log('- Standard Traitor: traitor@nexus.io (pwd: password123)');

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

    const tactical = await Category.create({
      name: 'Tactical Gear',
      slug: 'tactical-gear',
      description: 'Ballistic plating, thermal masking, and hazard protection suits.'
    });

    const software = await Category.create({
      name: 'Neural Software',
      slug: 'neural-software',
      description: 'Decompilers, defensive ICE, and AI subroutines for decks.'
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

    // Expanded products to populate the store nicely
    const p6 = await Product.create({
      sku: 'NEX-TAC-ARMOR',
      name: 'Subdermal Nano-Plating',
      slug: 'subdermal-nano-plating',
      description: 'Flexible grid-based microscopic carbon plates injected beneath the epidermal layer. High impact resistance, hazard protection, lightweight.',
      price: 850.00,
      compareAtPrice: 999.00,
      inventory: { countInStock: 15, lowStockThreshold: 5 },
      category: tactical._id,
      tags: ['combat', 'armor', 'tactical', 'subdermal'],
      images: [
        { url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300', altText: 'Subdermal Plating', isPrimary: true }
      ]
    });

    const p7 = await Product.create({
      sku: 'NEX-TAC-CLOAK',
      name: 'Thermal Invisibility Cloak',
      slug: 'thermal-invisibility-cloak',
      description: 'Binds with background infrared signatures to render the operator completely invisible to security scanners and thermal visor optics.',
      price: 420.00,
      compareAtPrice: 499.99,
      inventory: { countInStock: 4, lowStockThreshold: 5 }, // Low stock edge case
      category: tactical._id,
      tags: ['stealth', 'cloak', 'tactical', 'invisible'],
      images: [
        { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=300', altText: 'Thermal Cloak', isPrimary: true }
      ]
    });

    const p8 = await Product.create({
      sku: 'NEX-SFT-ICE',
      name: 'Neural ICE-Breaker Daemon',
      slug: 'neural-ice-breaker-daemon',
      description: 'High-bandwidth decryptor script built to smash standard security firewalls and corporate mainframe defenses within seconds.',
      price: 195.00,
      inventory: { countInStock: 120, lowStockThreshold: 10 },
      category: software._id,
      tags: ['hacking', 'ice', 'software', 'daemon'],
      images: [
        { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=300', altText: 'ICE Breaker Grid', isPrimary: true }
      ]
    });

    const p9 = await Product.create({
      sku: 'NEX-AUG-REFLEX',
      name: 'Synapse Reflex Accelerator',
      slug: 'synapse-reflex-accelerator',
      description: 'Chemical and electrical injector system boosting neuron response speeds by 300%. Perfect for tactical matrix runs.',
      price: 540.00,
      inventory: { countInStock: 12, lowStockThreshold: 3 },
      category: cyberware._id,
      tags: ['reflex', 'synapse', 'booster', 'augment'],
      images: [
        { url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=300', altText: 'Reflex Accelerator', isPrimary: true }
      ]
    });

    const p10 = await Product.create({
      sku: 'NEX-WST-PLASMA',
      name: 'Plasma Cooling Block',
      slug: 'plasma-cooling-block',
      description: 'A physical high-density liquid core block providing sub-zero temperatures for overloaded processor modules running custom kernels.',
      price: 175.50,
      inventory: { countInStock: 25, lowStockThreshold: 5 },
      category: sludge._id,
      tags: ['coolant', 'plasma', 'cooling', 'block'],
      images: [
        { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300', altText: 'Cooling Block Module', isPrimary: true }
      ]
    });

    const p11 = await Product.create({
      sku: 'NEX-TAC-EMP',
      name: 'EMP Shockwave Grenade',
      slug: 'emp-shockwave-grenade',
      description: 'Tactical grenade emitting a concentrated high-frequency electromagnetic shockwave. Disables all local drones and security bots.',
      price: 65.00,
      inventory: { countInStock: 3, lowStockThreshold: 2 }, // Low stock
      category: tactical._id,
      tags: ['emp', 'combat', 'grenade', 'tactical'],
      images: [
        { url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=300', altText: 'EMP device', isPrimary: true }
      ]
    });

    const p12 = await Product.create({
      sku: 'NEX-DEC-TUNNEL',
      name: 'Darknet Tunnel Router',
      slug: 'darknet-tunnel-router',
      description: 'Hardware multi-tunnel routing deck that automatically bounces outgoing connections through 32 international proxy nodes.',
      price: 310.00,
      inventory: { countInStock: 0, lowStockThreshold: 3 }, // Out of stock
      category: decks._id,
      tags: ['router', 'stealth', 'tunnel', 'deck'],
      images: [
        { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=300', altText: 'Tunnel Router Primary', isPrimary: true }
      ]
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

    // Also seed empty carts for administrative and buyer users
    await Cart.create({ user: superadmin._id, items: [] });
    await Cart.create({ user: editor._id, items: [] });
    await Cart.create({ user: buyer._id, items: [] });
    await Cart.create({ user: traitor._id, items: [] });
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

    // Seed past orders history (timeline checking and Recharts analytics stats)
    // We will generate 15 orders distributed over the last 30 days.
    const ordersData = [
      {
        user: testUser._id,
        items: [{ product: p1._id, name: p1.name, qty: 1, priceAtPurchase: p1.price, sku: p1.sku }],
        fulfillmentStatus: 'Delivered',
        paymentStatus: 'Completed',
        daysAgo: 28,
        method: 'Stripe'
      },
      {
        user: testUser._id,
        items: [{ product: p3._id, name: p3.name, qty: 2, priceAtPurchase: p3.price, sku: p3.sku }],
        fulfillmentStatus: 'Shipped',
        paymentStatus: 'Completed',
        daysAgo: 24,
        method: 'PayPal',
        trackingNumber: 'TRK-NEX-882901'
      },
      {
        user: buyer._id,
        items: [
          { product: p6._id, name: p6.name, qty: 1, priceAtPurchase: p6.price, sku: p6.sku },
          { product: p8._id, name: p8.name, qty: 2, priceAtPurchase: p8.price, sku: p8.sku }
        ],
        fulfillmentStatus: 'Delivered',
        paymentStatus: 'Completed',
        daysAgo: 20,
        method: 'Stripe'
      },
      {
        user: testUser._id,
        items: [{ product: p2._id, name: p2.name, qty: 1, priceAtPurchase: p2.price, sku: p2.sku }],
        fulfillmentStatus: 'Processing',
        paymentStatus: 'Completed',
        daysAgo: 18,
        method: 'Stripe'
      },
      {
        user: traitor._id,
        items: [{ product: p7._id, name: p7.name, qty: 1, priceAtPurchase: p7.price, sku: p7.sku }],
        fulfillmentStatus: 'Delivered',
        paymentStatus: 'Completed',
        daysAgo: 16,
        method: 'PayPal'
      },
      {
        user: testUser._id,
        items: [{ product: p3._id, name: p3.name, qty: 1, priceAtPurchase: p3.price, sku: p3.sku }],
        fulfillmentStatus: 'Unfulfilled',
        paymentStatus: 'Pending',
        daysAgo: 14,
        method: 'PayPal'
      },
      {
        user: buyer._id,
        items: [{ product: p10._id, name: p10.name, qty: 3, priceAtPurchase: p10.price, sku: p10.sku }],
        fulfillmentStatus: 'Shipped',
        paymentStatus: 'Completed',
        daysAgo: 12,
        method: 'Stripe',
        trackingNumber: 'TRK-NEX-771920'
      },
      {
        user: testUser._id,
        items: [{ product: p1._id, name: p1.name, qty: 1, priceAtPurchase: p1.price, sku: p1.sku }],
        fulfillmentStatus: 'Returned',
        paymentStatus: 'Refunded',
        daysAgo: 10,
        method: 'Stripe'
      },
      {
        user: null, // Guest Checkout
        guestEmail: 'neon_runner_99@gmail.com',
        items: [{ product: p8._id, name: p8.name, qty: 1, priceAtPurchase: p8.price, sku: p8.sku }],
        fulfillmentStatus: 'Unfulfilled',
        paymentStatus: 'Completed',
        daysAgo: 8,
        method: 'Stripe'
      },
      {
        user: buyer._id,
        items: [{ product: p9._id, name: p9.name, qty: 1, priceAtPurchase: p9.price, sku: p9.sku }],
        fulfillmentStatus: 'Delivered',
        paymentStatus: 'Completed',
        daysAgo: 6,
        method: 'Stripe'
      },
      {
        user: testUser._id,
        items: [
          { product: p3._id, name: p3.name, qty: 1, priceAtPurchase: p3.price, sku: p3.sku },
          { product: p11._id, name: p11.name, qty: 1, priceAtPurchase: p11.price, sku: p11.sku }
        ],
        fulfillmentStatus: 'Processing',
        paymentStatus: 'Completed',
        daysAgo: 5,
        method: 'PayPal'
      },
      {
        user: null, // Guest Checkout
        guestEmail: 'console_cowboy@nexus.io',
        items: [{ product: p6._id, name: p6.name, qty: 1, priceAtPurchase: p6.price, sku: p6.sku }],
        fulfillmentStatus: 'Unfulfilled',
        paymentStatus: 'Completed',
        daysAgo: 4,
        method: 'Stripe'
      },
      {
        user: traitor._id,
        items: [{ product: p10._id, name: p10.name, qty: 1, priceAtPurchase: p10.price, sku: p10.sku }],
        fulfillmentStatus: 'Canceled',
        paymentStatus: 'Failed',
        daysAgo: 3,
        method: 'PayPal'
      },
      {
        user: testUser._id,
        items: [{ product: p8._id, name: p8.name, qty: 5, priceAtPurchase: p8.price, sku: p8.sku }],
        fulfillmentStatus: 'Unfulfilled',
        paymentStatus: 'Completed',
        daysAgo: 2,
        method: 'Stripe'
      },
      {
        user: buyer._id,
        items: [{ product: p7._id, name: p7.name, qty: 1, priceAtPurchase: p7.price, sku: p7.sku }],
        fulfillmentStatus: 'Processing',
        paymentStatus: 'Completed',
        daysAgo: 1,
        method: 'Stripe'
      },
      {
        user: null, // Guest Checkout
        guestEmail: 'guest_runner@nexus.io',
        items: [{ product: p3._id, name: p3.name, qty: 1, priceAtPurchase: p3.price, sku: p3.sku }],
        fulfillmentStatus: 'Unfulfilled',
        paymentStatus: 'Completed',
        daysAgo: 0,
        method: 'Stripe'
      }
    ];

    for (let i = 0; i < ordersData.length; i++) {
      const o = ordersData[i];
      let subtotal = 0;
      for (const item of o.items) {
        subtotal += item.priceAtPurchase * item.qty;
      }
      const tax = subtotal * 0.08;
      const shippingCost = subtotal > 150 ? 0 : 10;
      const total = subtotal + tax + shippingCost;
      const orderNumber = `NEX-${100000 + i}-${Math.floor(Math.random() * 100)}`;

      await Order.create({
        orderNumber,
        user: o.user,
        guestEmail: o.guestEmail,
        items: o.items,
        shippingAddress: o.user 
          ? (o.user.toString() === testUser._id.toString() ? testUser.addresses[0] : buyer.addresses[0]) 
          : { street: '404 Grid Pipeline, Block B', city: 'Neotropolis', state: 'Sector 4', zip: '99031', country: 'Neoterra' },
        billingAddress: o.user 
          ? (o.user.toString() === testUser._id.toString() ? testUser.addresses[0] : buyer.addresses[0]) 
          : { street: '404 Grid Pipeline, Block B', city: 'Neotropolis', state: 'Sector 4', zip: '99031', country: 'Neoterra' },
        payment: {
          method: o.method,
          transactionId: `TX-MOCK-${8800 + i}`,
          status: o.paymentStatus
        },
        financials: {
          subtotal,
          tax,
          shippingCost,
          discountAmount: 0,
          total
        },
        fulfillmentStatus: o.fulfillmentStatus,
        trackingNumber: o.trackingNumber,
        createdAt: new Date(Date.now() - o.daysAgo * 24 * 60 * 60 * 1000 - (3 * 60 * 60 * 1000))
      });
    }

    console.log('Past Orders history timeline seeded.');

    // Seed Reviews across multiple products
    // Product 1 reviews (Ocular Bio-Lens)
    await Review.create({
      product: p1._id,
      user: testUser._id,
      rating: 5,
      title: 'Flawless Interface',
      comment: 'Retinal rendering throughput is exceptionally high. Perfect Acid Green glow overlays.',
      images: ['https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=300'],
      isVerifiedPurchase: true
    });

    await Review.create({
      product: p1._id,
      user: buyer._id,
      rating: 4,
      title: 'High Calibration',
      comment: 'Great interface overlays. Emits high brightness but consumes standard cell battery quickly.',
      isVerifiedPurchase: false
    });

    p1.reviews.totalReviews = 2;
    p1.reviews.averageRating = 4.5;
    await p1.save();

    // Product 2 reviews (Hacking Rig)
    await Review.create({
      product: p2._id,
      user: buyer._id,
      rating: 5,
      title: 'Sublime Hacking Speeds',
      comment: 'Smplifies decompiler subroutines instantly. Extremely premium polymer chassis.',
      isVerifiedPurchase: true
    });

    p2.reviews.totalReviews = 1;
    p2.reviews.averageRating = 5;
    await p2.save();

    // Product 6 reviews (Subdermal Nano-Plating)
    await Review.create({
      product: p6._id,
      user: buyer._id,
      rating: 5,
      title: 'Feels like absolute titanium',
      comment: 'Fully protected me against standard combat shockwaves. Completely worth the credits.',
      isVerifiedPurchase: true
    });

    await Review.create({
      product: p6._id,
      user: traitor._id,
      rating: 2,
      title: 'Too heavy',
      comment: 'Impact absorption is standard, but the weight drags down evasion vectors in simulated runs.',
      isVerifiedPurchase: true
    });

    p6.reviews.totalReviews = 2;
    p6.reviews.averageRating = 3.5;
    await p6.save();

    // Product 8 reviews (Neural ICE-Breaker)
    await Review.create({
      product: p8._id,
      user: buyer._id,
      rating: 5,
      title: 'Instant decryption',
      comment: 'Bypassed standard node firewalls instantly. High recommended script.',
      isVerifiedPurchase: true
    });

    p8.reviews.totalReviews = 1;
    p8.reviews.averageRating = 5.0;
    await p8.save();

    console.log('Reviews seeded.');

    // Seed CMS homepage configurations
    await CMS.create({
      key: 'homepage',
      heroBanner: {
        title: 'PROJECT NEXUS // DIRECT UPLINK',
        subtitle: 'Secure radioactive waste, hacking rigs, and tactical combat augments.',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800',
        ctaText: 'INITIALIZE DIRECTORY'
      },
      featuredProducts: [p1._id, p2._id, p6._id, p8._id]
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
