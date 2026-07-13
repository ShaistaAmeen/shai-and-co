# Shai & Co. — Full-Stack E-commerce Store

A visually distinctive full-stack e-commerce demo built for the CodeAlpha Full Stack Development internship (Task 1).

**Stack:** Express.js (Node.js) + vanilla HTML/CSS/JS. Data is stored in a JSON file via `lowdb` (swap for MongoDB/PostgreSQL easily — see "Swapping the database" below).

## About the collection

Shai & Co. is styled as a boutique retailer of **heels and luxury handbags** rather than a generic mixed-category storefront — a deliberate choice to make the product copy, imagery, and brand voice cohere around one point of view instead of reading as a tutorial catalog. The tagline, **"Siren. Spell. Souvenir."**, was chosen the same way: each word plays on the idea of being drawn in, captivated, and left with something to remember it by — down to "souvenir" literally meaning "to remember" at its French root.

## Design

Built as an editorial/boutique storefront rather than a generic product-grid template:

- **Palette:** deep aubergine-ink, warm bone/paper tones, antique brass and garnet accents
- **Type:** Italiana (brand wordmark & display) + Cormorant Garamond (headings, product names) + Manrope (UI/body) + JetBrains Mono (prices/labels)
- **Signature interaction:** a "veil-lift" reveal — product images unveil behind a satin scrim on hover/load, echoed in the hero showcase and the product detail image
- **Motion:** staggered card entrance animations, a slide-out cart drawer, toast notifications, an animated "printing" receipt on order confirmation with a stamped seal

## Features

- **Product listings** — grid with category chips, live search-as-you-type with an inline suggestions dropdown, skeleton loading states
- **Product details page** — full description, star ratings, quantity selector, wishlist heart, related products
- **Shopping cart** — slide-out drawer (no page reload) **and** a dedicated full cart page; add/update/remove, stock-aware
- **User registration & login** — JWT-based auth in an httpOnly cookie, bcrypt-hashed passwords, split-screen editorial auth pages
- **Order processing** — checkout with shipping address, stock validation & deduction, order history, animated receipt-style confirmation
- **Wishlist** — heart-toggle on any product card, persisted per user, dedicated wishlist page
- **Toast notifications** — replace browser `alert()` throughout

## Project structure

\```
ecommerce-app/
├── server.js
├── config/db.js            # lowdb setup + seed data (12 products with ratings, hover images, taglines)
├── middleware/auth.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   └── wishlist.js
├── data/db.json             # auto-created JSON "database"
└── public/
    ├── index.html            # hero + product grid
    ├── product.html           # product detail + related products
    ├── cart.html              # full cart page
    ├── checkout.html
    ├── order-confirmation.html
    ├── orders.html
    ├── wishlist.html
    ├── login.html / register.html   # split-screen editorial layout
    ├── css/style.css          # full design system
    └── js/app.js              # API wrapper, toasts, cart drawer, header, wishlist
\```

## Getting started

\```bash
npm install
cp .env.example .env      # optional: edit JWT_SECRET
npm start
\```

Then open **http://localhost:3000**.

The database seeds itself with 12 sample products (heels & bags) on first run. Delete `data/db.json` any time to reset all data.

## API reference


|
 Method 
|
 Endpoint 
|
 Auth 
|
 Description 
|
|
---
|
---
|
---
|
---
|
|
 POST 
|
`/api/auth/register`
|
 – 
|
 Create account 
`{ name, email, password }`
|
|
 POST 
|
`/api/auth/login`
|
 – 
|
 Log in 
`{ email, password }`
|
|
 POST 
|
`/api/auth/logout`
|
 – 
|
 Clear session cookie 
|
|
 GET 
|
`/api/auth/me`
|
 – 
|
 Current logged-in user (or 
`null`
) 
|
|
 GET 
|
`/api/products`
|
 – 
|
 List products, 
`?category=`
`?search=`
`?featured=true`
 filters 
|
|
 GET 
|
`/api/products/categories`
|
 – 
|
 Distinct category list 
|
|
 GET 
|
`/api/products/:id`
|
 – 
|
 Single product detail 
|
|
 GET 
|
`/api/cart`
|
 ✅ 
|
 Current user's cart with totals 
|
|
 POST 
|
`/api/cart`
|
 ✅ 
|
 Add item 
`{ productId, quantity }`
|
|
 PUT 
|
`/api/cart/:productId`
|
 ✅ 
|
 Update quantity 
`{ quantity }`
|
|
 DELETE 
|
`/api/cart/:productId`
|
 ✅ 
|
 Remove one item 
|
|
 DELETE 
|
`/api/cart`
|
 ✅ 
|
 Clear cart 
|
|
 POST 
|
`/api/orders`
|
 ✅ 
|
 Checkout 
`{ shippingAddress }`
 — validates stock, deducts it, clears cart 
|
|
 GET 
|
`/api/orders`
|
 ✅ 
|
 Order history for current user 
|
|
 GET 
|
`/api/orders/:id`
|
 ✅ 
|
 Single order detail 
|
|
 GET 
|
`/api/wishlist`
|
 ✅ 
|
 Saved products 
|
|
 POST 
|
`/api/wishlist/:productId`
|
 ✅ 
|
 Toggle a product on/off the wishlist 
|

Auth is enforced via a JWT stored in an httpOnly cookie (`token`), set automatically on register/login. Endpoints marked ✅ return `401` if not logged in.

## Swapping the database

This project uses `lowdb` (a JSON file) so it runs anywhere with zero setup. To extend it with a real database:

- **MongoDB**: replace `config/db.js` with a `mongoose` connection, and turn the `db.get('products').value()`-style calls in each route file into Mongoose model calls. Route logic and response shapes can stay the same.
- **PostgreSQL/MySQL**: same idea, using an ORM like Prisma or Sequelize.

## Notes on scope

- No real payment processor is integrated — checkout just records the order.
- Product images are hotlinked from Unsplash for demo purposes.
- The JSON "database" is fine for development but isn't safe for concurrent production traffic — see "Swapping the database" above.