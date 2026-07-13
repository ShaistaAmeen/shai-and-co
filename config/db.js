const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, '..', 'data', 'db.json'));
const db = low(adapter);

// Bump this whenever the product catalog shape changes. On mismatch, products
// are reseeded automatically so a stale local data/db.json can never crash
// the frontend by missing fields like `rating`.
const SEED_VERSION = 3;

db.defaults({
  meta: { seedVersion: 0 },
  users: [],
  products: [],
  orders: [],
  carts: [],
  wishlists: []
}).write();

const currentVersion = db.get('meta.seedVersion').value();

if (currentVersion !== SEED_VERSION) {
  db.set('products', [
    // ---------------- Heels ----------------
    {
      id: 'p1',
      name: 'Blush Patent Stiletto',
      reading: 'The kind of shine that ends a conversation you were losing.',
      description: 'A glass-finish patent stiletto in soft blush, cut on a 100mm heel with a needle-fine profile. Leather-lined, leather sole, made for the room to notice before you speak.',
      price: 415,
      category: 'Heels',
      stock: 14,
      rating: 4.8,
      reviewCount: 231,
      featured: true,
      image: 'https://images.unsplash.com/photo-1573100925118-870b8efc799d?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=700'
    },
    {
      id: 'p2',
      name: 'Noir Court Pump',
      reading: 'Black, and completely unbothered by the competition.',
      description: 'The definitive black pump. Supple calfskin, a rounded almond toe, and a 90mm heel balanced for a full day on your feet without confessing it.',
      price: 380,
      category: 'Heels',
      stock: 3,
      rating: 4.9,
      reviewCount: 412,
      featured: true,
      image: 'https://images.unsplash.com/photo-1627631457335-d1041fd0cb8c?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1581101767113-1677fc2beaa8?w=700'
    },
    {
      id: 'p3',
      name: 'Frost Glitter Pump',
      reading: 'Built for the one night everyone remembers wrong details about.',
      description: 'Hand-set micro-glitter over a pearl-white shell, finished with a covered stiletto heel. An evening pump that photographs better than it has any right to.',
      price: 340,
      category: 'Heels',
      stock: 21,
      rating: 4.6,
      reviewCount: 158,
      featured: false,
      image: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700'
    },
    {
      id: 'p4',
      name: 'Cognac Pointed Pump',
      reading: 'The one pair that makes every outfit look pre-planned.',
      description: 'Cognac-toned pointed-toe pump in vegetable-tanned leather that deepens in colour with wear. A 70mm block heel keeps it office-to-dinner practical.',
      price: 295,
      category: 'Heels',
      stock: 27,
      rating: 4.5,
      reviewCount: 96,
      featured: false,
      image: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1553545985-1e0d8781d5db?w=700'
    },
    {
      id: 'p5',
      name: 'Crimson Statement Heel',
      reading: 'Not a neutral. Not trying to be.',
      description: 'A saturated crimson heel in Italian nappa leather, 95mm, with a sculpted heel counter. One pair that decides the rest of the outfit for you.',
      price: 360,
      category: 'Heels',
      stock: 5,
      rating: 4.7,
      reviewCount: 174,
      featured: true,
      image: 'https://images.unsplash.com/photo-1611233299310-f6276ff55307?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1659261448687-6d01466e06e4?w=700'
    },
    {
      id: 'p6',
      name: 'Amethyst Evening Heel',
      reading: 'Everyone else wore black. You did not get that memo, on purpose.',
      description: 'A jewel-toned satin heel in deep amethyst with a delicate ankle strap. Cushioned footbed underneath all that drama, so the night actually lasts.',
      price: 325,
      category: 'Heels',
      stock: 16,
      rating: 4.4,
      reviewCount: 67,
      featured: false,
      image: 'https://images.unsplash.com/photo-1632793039179-8d97795d20c6?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1551489186-ccb95a1ea6a3?w=700'
    },
    // ---------------- Bags ----------------
    {
      id: 'p7',
      name: 'Noir Structured Shoulder Bag',
      reading: 'Holds everything. Confesses nothing.',
      description: 'A rigid-structure shoulder bag in full-grain black leather with brushed gold hardware and a detachable chain strap. The bag that ends the search for "the one."',
      price: 890,
      category: 'Bags',
      stock: 9,
      rating: 4.9,
      reviewCount: 288,
      featured: true,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1583623733237-4d5764a9dc82?w=700'
    },
    {
      id: 'p8',
      name: 'Ivory Top-Handle Bag',
      reading: 'The bag that makes the rest of the outfit look intentional.',
      description: 'A boxy top-handle bag in ivory calfskin with a detachable strap and a suede-lined interior. Understated hardware, overstated impression.',
      price: 760,
      category: 'Bags',
      stock: 2,
      rating: 4.8,
      reviewCount: 143,
      featured: true,
      image: 'https://images.unsplash.com/photo-1682745230951-8a5aa9a474a0?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=700'
    },
    {
      id: 'p9',
      name: 'Heritage Monogram Tote',
      reading: 'The tote your grandchildren will fight over.',
      description: 'A generously scaled tote in monogrammed coated canvas with natural leather trim. Built to hold a laptop, a life, and still close properly.',
      price: 1150,
      category: 'Bags',
      stock: 12,
      rating: 4.7,
      reviewCount: 201,
      featured: false,
      isNew: true,
      image: 'https://images.unsplash.com/photo-1691480288782-142b953cf664?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1682364853177-b69f92750a96?w=700'
    },
    {
      id: 'p10',
      name: 'Blanc Leather Clutch',
      reading: 'Small enough to seem effortless. It was not effortless.',
      description: 'A hand-stitched leather clutch in soft white nappa with a hidden magnetic clasp. Just enough room for what actually matters at a table for two.',
      price: 480,
      category: 'Bags',
      stock: 24,
      rating: 4.5,
      reviewCount: 89,
      featured: false,
      image: 'https://images.unsplash.com/photo-1589731119540-c4586781dae1?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1743324690280-62c0699f46d2?w=700'
    },
    {
      id: 'p11',
      name: 'Rouge Leather Handbag',
      reading: 'The one bag that gets asked about every single time.',
      description: 'A structured handbag in saturated rouge leather with a gold-tone turn-lock closure. Impossible to lose in a crowded room, which is rather the point.',
      price: 720,
      category: 'Bags',
      stock: 4,
      rating: 4.6,
      reviewCount: 112,
      featured: true,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1603009135528-7ad60fc1ffe4?w=700'
    },
    {
      id: 'p12',
      name: 'Bordeaux Structured Bag',
      reading: 'Bordeaux, because black felt like playing it safe.',
      description: 'A deep bordeaux structured bag in pebbled leather with a sculpted top handle and adjustable crossbody strap. Built for the days that run long.',
      price: 650,
      category: 'Bags',
      stock: 19,
      rating: 4.4,
      reviewCount: 74,
      featured: false,
      isNew: true,
      image: 'https://images.unsplash.com/photo-1591348278900-019a8a2a8b1d?w=700',
      hoverImage: 'https://images.unsplash.com/photo-1682364853446-db043f643207?w=700'
    }
  ]).write();

  db.set('meta.seedVersion', SEED_VERSION).write();
}

module.exports = db;
