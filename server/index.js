import express from 'express';
import cors from 'cors';
import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

// SQLite setup
let db;
const DB_FILE = 'duka.db';

async function initDatabase() {
  const SQL = await initSqlJs();
  
  if (existsSync(DB_FILE)) {
    const buffer = readFileSync(DB_FILE);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    // Create tables
    db.run(`
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
    
    // Seed if empty
    try {
      const result = db.exec('SELECT COUNT(*) as c FROM products');
      const productCount = result.length > 0 && result[0].values.length > 0 
        ? result[0].values[0][0] 
        : 0;
      
      if (productCount === 0) {
        const { products, categories } = await import('./data.js');
        
        const toJson = (v) => JSON.stringify(v ?? []);
        const toNull = (v) => v ?? null;
        
        // Insert products
        for (const p of products) {
          db.run(
            `INSERT INTO products (
              id, name, price, originalPrice, discountPercentage, discountEndDate, discountIsActive,
              image, images, category, description, rating, reviews, inStock, features, brand
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id,
              p.name,
              p.price,
              toNull(p.originalPrice),
              p.discount?.percentage ?? null,
              p.discount?.endDate ?? null,
              p.discount?.isActive ? 1 : 0,
              p.image,
              toJson(p.images),
              p.category,
              p.description,
              p.rating,
              p.reviews,
              p.inStock ? 1 : 0,
              toJson(p.features),
              p.brand
            ]
          );
        }
        
        // Insert categories
        for (const c of categories) {
          db.run(
            `INSERT INTO categories (id, name, icon, count) VALUES (?, ?, ?, ?)`,
            [c.id, c.name, c.icon, c.count]
          );
        }
      }
    } catch (e) {
      console.error('Seed error', e);
    }
    
    saveDatabase();
  }
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_FILE, buffer);
  }
}

// Helper function to convert sql.js result to array of objects
function resultToObjects(result) {
  if (!result || result.length === 0) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

// Initialize database
await initDatabase();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/products', (_req, res) => {
  try {
    const result = db.exec('SELECT * FROM products');
    const rows = resultToObjects(result);
    
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
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/categories', (_req, res) => {
  try {
    const result = db.exec('SELECT * FROM categories');
    const rows = resultToObjects(result);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    // sql.js doesn't support parameterized queries in exec(), so we use run() with prepared statement
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    stmt.bind([req.params.id]);
    const result = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      result.push(row);
    }
    stmt.free();
    const rows = result;
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const r = rows[0];
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
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
