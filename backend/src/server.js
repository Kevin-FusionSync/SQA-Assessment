import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { categories, products, users, coupons, carts, orders, sessions, counters } from './data.js';

const PORT = process.env.PORT || 4000;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 8;
const MAX_QTY_PER_ITEM = 10;
const DELIVERY_FEE = 5;
const FREE_DELIVERY_THRESHOLD = 75;
const TAX_RATE = 0.08;

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

const round2 = (n) => Math.round(n * 100) / 100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (res, status, message, field) => res.status(status).json({ error: message, ...(field ? { field } : {}) });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\d{10,15}$/;
const ZIP_RE = /^\d{5}$/;

function publicUser(user) {
  return { ...user };
}

function publicProduct(p) {
  return { ...p, inStock: p.stock > 0, image: `/images/${p.id}.svg` };
}

// ---------- auth ----------

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const session = token && sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return fail(res, 401, 'Please sign in to continue');
  }
  req.user = users.find((u) => u.id === session.userId);
  if (!req.user) return fail(res, 401, 'Please sign in to continue');
  req.token = token;
  next();
}

function createSession(userId) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

app.post('/api/auth/register', (req, res) => {
  const name = (req.body?.name || '').trim();
  const email = (req.body?.email || '').trim();
  const password = req.body?.password || '';

  if (name.length < 2) return fail(res, 400, 'Name must be at least 2 characters', 'name');
  if (!EMAIL_RE.test(email)) return fail(res, 400, 'Enter a valid email address', 'email');
  if (password.length < 7 || !/\d/.test(password)) {
    return fail(res, 400, 'Password must be at least 8 characters and include a number', 'password');
  }
  if (users.some((u) => u.email === email)) return fail(res, 409, 'An account with this email already exists', 'email');

  const user = { id: counters.userId++, name, email, password, phone: '', createdAt: new Date().toISOString() };
  users.push(user);
  const token = createSession(user.id);
  res.status(201).json({ token, user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const email = (req.body?.email || '').trim();
  const password = req.body?.password || '';
  const user = users.find((u) => u.email === email);
  if (!user || user.password !== password) return fail(res, 401, 'Invalid email or password');
  const token = createSession(user.id);
  res.json({ token, user: publicUser(user) });
});

app.post('/api/auth/logout', auth, (req, res) => {
  sessions.delete(req.token);
  res.status(204).end();
});

app.get('/api/me', auth, (req, res) => {
  res.json(publicUser(req.user));
});

app.put('/api/me', auth, (req, res) => {
  const { name, phone } = req.body || {};
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) return fail(res, 400, 'Name must be at least 2 characters', 'name');
    req.user.name = name.trim();
  }
  if (phone !== undefined) {
    const digits = String(phone).trim();
    if (digits !== '' && !PHONE_RE.test(digits)) return fail(res, 400, 'Phone must be 10–15 digits', 'phone');
    req.user.phone = digits;
  }
  res.json(publicUser(req.user));
});

// ---------- catalogue ----------

app.get('/api/categories', (_req, res) => {
  res.json(categories.map((c) => ({ ...c, count: products.filter((p) => p.category === c.id).length })));
});

const sorters = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => String(b.price).localeCompare(String(a.price)),
  rating: (a, b) => b.rating - a.rating,
};

app.get('/api/products', (req, res) => {
  const search = String(req.query.search || '').trim().toLowerCase();
  const category = String(req.query.category || '');
  const sort = sorters[req.query.sort] ? req.query.sort : 'newest';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  let list = products.filter(
    (p) => (!search || p.name.toLowerCase().includes(search)) && (!category || p.category === category),
  );
  list = [...list].sort(sorters[sort]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  res.json({
    items: list.slice(start, start + PAGE_SIZE).map(publicProduct),
    page,
    pageSize: PAGE_SIZE,
    total: list.length,
    totalPages,
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return fail(res, 404, 'Product not found');
  res.json(publicProduct(product));
});

app.get('/images/:id.svg', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  const bg = product?.color || '#EEEEEE';
  const emoji = product?.emoji || '🛒';
  res.set('Cache-Control', 'public, max-age=86400');
  res.type('image/svg+xml').send(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">` +
      `<defs><radialGradient id="bg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/><stop offset="0.55" stop-color="${bg}" stop-opacity="0"/></radialGradient>` +
      `<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#10231a" flood-opacity="0.22"/></filter></defs>` +
      `<rect width="400" height="300" fill="${bg}"/><rect width="400" height="300" fill="url(#bg)"/>` +
      `<circle cx="340" cy="40" r="70" fill="#ffffff" fill-opacity="0.25"/><circle cx="50" cy="270" r="55" fill="#ffffff" fill-opacity="0.2"/>` +
      `<ellipse cx="200" cy="238" rx="92" ry="14" fill="#10231a" fill-opacity="0.08"/>` +
      `<text x="200" y="192" font-size="128" text-anchor="middle" filter="url(#sh)">${emoji}</text></svg>`,
  );
});

// ---------- cart ----------

function getCart(userId) {
  if (!carts.has(userId)) carts.set(userId, { items: [], coupon: null });
  return carts.get(userId);
}

function findCoupon(code) {
  return coupons.find((c) => c.code === String(code || '').trim().toUpperCase());
}

function couponError(coupon, subtotal) {
  if (!coupon) return 'This coupon code is not valid';
  if (coupon.expiry && new Date(coupon.expiry) < new Date()) return 'This coupon has expired';
  if (subtotal <= coupon.minSubtotal && coupon.minSubtotal > 0) {
    return `Add $${(coupon.minSubtotal - subtotal).toFixed(2)} more to use this coupon`;
  }
  return null;
}

function priceCart(cart) {
  const items = cart.items
    .map((i) => {
      const product = products.find((p) => p.id === i.productId);
      return product ? { productId: i.productId, qty: i.qty, product: publicProduct(product), lineTotal: round2(product.price * i.qty) } : null;
    })
    .filter(Boolean);

  const subtotal = round2(items.reduce((sum, i) => sum + i.lineTotal, 0));
  let coupon = cart.coupon ? findCoupon(cart.coupon) : null;
  let couponMessage = null;
  if (coupon && couponError(coupon, subtotal)) {
    couponMessage = couponError(coupon, subtotal);
    coupon = null;
  }

  const discount = coupon?.type === 'percent' ? round2((subtotal * coupon.value) / 100) : 0;
  const freeDelivery = coupon?.type === 'freeDelivery' || subtotal >= FREE_DELIVERY_THRESHOLD;
  const delivery = items.length === 0 || freeDelivery ? 0 : DELIVERY_FEE;
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal - discount + delivery + tax);

  return {
    items,
    coupon: coupon ? { code: coupon.code, description: coupon.description } : null,
    couponMessage,
    summary: { subtotal, discount, delivery, tax, total },
  };
}

app.get('/api/cart', auth, (req, res) => {
  res.json(priceCart(getCart(req.user.id)));
});

app.post('/api/cart/items', auth, (req, res) => {
  const productId = Number(req.body?.productId);
  const qty = req.body?.qty === undefined ? 1 : Number(req.body.qty);
  const product = products.find((p) => p.id === productId);
  if (!product) return fail(res, 404, 'Product not found');
  if (!Number.isInteger(qty) || qty < 1) return fail(res, 400, 'Quantity must be at least 1', 'qty');
  if (product.stock === 0) return fail(res, 409, `${product.name} is out of stock`);

  const cart = getCart(req.user.id);
  const existing = cart.items.find((i) => i.productId === productId);
  const newQty = (existing?.qty || 0) + qty;
  if (newQty > MAX_QTY_PER_ITEM) return fail(res, 400, `You can add at most ${MAX_QTY_PER_ITEM} of this item`, 'qty');
  if (newQty > product.stock) return fail(res, 409, `Only ${product.stock} left in stock`, 'qty');

  if (existing) existing.qty = newQty;
  else cart.items.push({ productId, qty });
  res.status(201).json(priceCart(cart));
});

app.patch('/api/cart/items/:productId', auth, (req, res) => {
  const productId = Number(req.params.productId);
  const cart = getCart(req.user.id);
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) return fail(res, 404, 'Item is not in your cart');
  const qty = Number(req.body?.qty);
  if (Number.isNaN(qty)) return fail(res, 400, 'Quantity must be a number', 'qty');
  item.qty = qty;
  res.json(priceCart(cart));
});

app.delete('/api/cart/items/:productId', auth, (req, res) => {
  const cart = getCart(req.user.id);
  cart.items = cart.items.filter((i) => i.productId !== Number(req.params.productId));
  res.json(priceCart(cart));
});

app.post('/api/cart/coupon', auth, (req, res) => {
  const cart = getCart(req.user.id);
  const coupon = findCoupon(req.body?.code);
  const { summary } = priceCart({ ...cart, coupon: null });
  const error = couponError(coupon, summary.subtotal);
  if (error) return fail(res, 400, error, 'code');
  cart.coupon = coupon.code;
  res.json(priceCart(cart));
});

app.delete('/api/cart/coupon', auth, (req, res) => {
  const cart = getCart(req.user.id);
  cart.coupon = null;
  res.json(priceCart(cart));
});

// ---------- orders ----------

function orderView(order) {
  return { ...order, canCancel: order.status === 'placed' };
}

app.get('/api/orders', auth, (req, res) => {
  res.json(orders.filter((o) => o.userId === req.user.id).map(orderView));
});

app.get('/api/orders/:id', auth, (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) return fail(res, 404, 'Order not found');
  res.json(orderView(order));
});

app.post('/api/orders', auth, async (req, res) => {
  const shipping = {
    fullName: String(req.body?.fullName || '').trim(),
    address: String(req.body?.address || '').trim(),
    city: String(req.body?.city || '').trim(),
    zip: String(req.body?.zip || '').trim(),
    phone: String(req.body?.phone || '').trim(),
  };
  const paymentMethod = req.body?.paymentMethod;

  if (shipping.fullName.length < 2) return fail(res, 400, 'Full name is required', 'fullName');
  if (shipping.address.length < 5) return fail(res, 400, 'Street address is required', 'address');
  if (shipping.city.length < 2) return fail(res, 400, 'City is required', 'city');
  if (!ZIP_RE.test(shipping.zip)) return fail(res, 400, 'ZIP code must be 5 digits', 'zip');
  if (!PHONE_RE.test(shipping.phone)) return fail(res, 400, 'Phone must be 10–15 digits', 'phone');
  if (!['cod', 'card'].includes(paymentMethod)) return fail(res, 400, 'Choose a payment method', 'paymentMethod');

  const cart = getCart(req.user.id);
  const priced = priceCart(cart);
  if (priced.items.length === 0) return fail(res, 400, 'Your cart is empty');
  for (const item of priced.items) {
    const product = products.find((p) => p.id === item.productId);
    if (item.qty > product.stock) return fail(res, 409, `Only ${product.stock} of ${product.name} left in stock`);
  }

  // Simulated payment authorisation
  await sleep(1200);

  for (const item of priced.items) {
    products.find((p) => p.id === item.productId).stock -= item.qty;
  }
  const order = {
    id: counters.orderId++,
    userId: req.user.id,
    status: 'placed',
    createdAt: new Date().toISOString(),
    paymentMethod,
    items: priced.items.map((i) => ({ productId: i.productId, name: i.product.name, price: i.product.price, qty: i.qty })),
    shipping,
    coupon: priced.coupon?.code || null,
    summary: priced.summary,
  };
  orders.push(order);
  carts.set(req.user.id, { items: [], coupon: null });
  res.status(201).json(orderView(order));
});

app.post('/api/orders/:id/cancel', auth, (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id) && o.userId === req.user.id);
  if (!order) return fail(res, 404, 'Order not found');
  if (order.status !== 'placed') return fail(res, 409, `Orders that are ${order.status} can no longer be cancelled`);
  order.status = 'cancelled';
  for (const item of order.items) {
    const product = products.find((p) => p.id === item.productId);
    if (product) product.stock += item.qty;
  }
  res.json(orderView(order));
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use((_req, res) => fail(res, 404, 'Not found'));

app.use((err, _req, res, _next) => {
  console.error(err);
  fail(res, err.status || 500, err.status ? err.message : 'Something went wrong');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FreshCart API running on http://localhost:${PORT}`);
});
