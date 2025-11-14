import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const PORT = process.env.PORT || 5000;

// SQLite setup
const db = new Database('duka.db');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  originalPrice REAL,
  discountPercentage INTEGER,
  discountEndDate TEXT,
  discountIsActive INTEGER,
  image TEXT,
  images TEXT,
  category TEXT,
  description TEXT,
  rating REAL,
  reviews INTEGER,
  inStock INTEGER,
  features TEXT,
  brand TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  count INTEGER
);
`);

// Seed if empty using server/data.js snapshot
try {
  const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (productCount === 0) {
    const { products, categories } = await import('./data.js');
    const insertProd = db.prepare(`INSERT INTO products (
      id, name, price, originalPrice, discountPercentage, discountEndDate, discountIsActive,
      image, images, category, description, rating, reviews, inStock, features, brand
    ) VALUES (@id, @name, @price, @originalPrice, @discountPercentage, @discountEndDate, @discountIsActive,
      @image, @images, @category, @description, @rating, @reviews, @inStock, @features, @brand)`);
    const insertCat = db.prepare(`INSERT INTO categories (id, name, icon, count) VALUES (@id, @name, @icon, @count)`);

    const toJson = (v) => JSON.stringify(v ?? []);
    const toNull = (v) => v ?? null;

    db.transaction(() => {
      for (const p of products) {
        insertProd.run({
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: toNull(p.originalPrice),
          discountPercentage: p.discount?.percentage ?? null,
          discountEndDate: p.discount?.endDate ?? null,
          discountIsActive: p.discount?.isActive ? 1 : 0,
          image: p.image,
          images: toJson(p.images),
          category: p.category,
          description: p.description,
          rating: p.rating,
          reviews: p.reviews,
          inStock: p.inStock ? 1 : 0,
          features: toJson(p.features),
          brand: p.brand
        });
      }
      for (const c of categories) {
        insertCat.run(c);
      }
    })();
  }
} catch (e) {
  console.error('Seed error', e);
}

app.use(cors());
app.use(express.json());

// Since products.ts is TS/ESM exporting named exports, we will lazy-load and map it
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/products', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products').all();
  const normalize = rows.map(r => ({
    id: r.id,
    name: r.name,
    price: r.price,
    originalPrice: r.originalPrice ?? undefined,
    discount: r.discountPercentage != null ? {
      percentage: r.discountPercentage,
      endDate: r.discountEndDate,
      isActive: !!r.discountIsActive
    } : undefined,
    image: r.image,
    images: JSON.parse(r.images || '[]'),
    category: r.category,
    description: r.description,
    rating: r.rating,
    reviews: r.reviews,
    inStock: !!r.inStock,
    features: JSON.parse(r.features || '[]'),
    brand: r.brand
  }));
  res.json(normalize);
});

app.get('/api/categories', (_req, res) => {
  const rows = db.prepare('SELECT * FROM categories').all();
  res.json(rows);
});

app.get('/api/products/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const product = {
    id: r.id,
    name: r.name,
    price: r.price,
    originalPrice: r.originalPrice ?? undefined,
    discount: r.discountPercentage != null ? {
      percentage: r.discountPercentage,
      endDate: r.discountEndDate,
      isActive: !!r.discountIsActive
    } : undefined,
    image: r.image,
    images: JSON.parse(r.images || '[]'),
    category: r.category,
    description: r.description,
    rating: r.rating,
    reviews: r.reviews,
    inStock: !!r.inStock,
    features: JSON.parse(r.features || '[]'),
    brand: r.brand
  };
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});


