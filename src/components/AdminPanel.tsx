import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { fetchProductsFromFirestore, createProduct, updateProduct, deleteProduct } from '../services/products';

export const AdminPanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<Omit<Product, 'id'>>({
    name: '', price: 0, image: '', images: [], category: '', description: '',
    rating: 0, reviews: 0, inStock: true, features: [], brand: ''
  });
  const [editingId, setEditingId] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const items = await fetchProductsFromFirestore();
      setProducts(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateProduct(editingId, form);
    } else {
      await createProduct(form);
    }
    setForm({ name: '', price: 0, image: '', images: [], category: '', description: '', rating: 0, reviews: 0, inStock: true, features: [], brand: '' });
    setEditingId('');
    await load();
  };

  const handleEdit = (p: Product) => {
    const { id, discount, ...rest } = p;
    setEditingId(id);
    setForm({ ...rest, discount });
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    await load();
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Panel</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow">
        <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input className="border p-2 rounded" placeholder="Brand" value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} />
        <input className="border p-2 rounded" type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} />
        <input className="border p-2 rounded" placeholder="Category" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} />
        <input className="border p-2 rounded" placeholder="Image URL" value={form.image} onChange={e=>setForm({...form, image:e.target.value})} />
        <input className="border p-2 rounded" placeholder="Images (comma separated)" value={form.images.join(',')} onChange={e=>setForm({...form, images:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
        <input className="border p-2 rounded" placeholder="Features (comma separated)" value={form.features.join(',')} onChange={e=>setForm({...form, features:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
        <textarea className="border p-2 rounded md:col-span-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <div className="flex items-center gap-2">
          <input id="instock" type="checkbox" checked={form.inStock} onChange={e=>setForm({...form, inStock:e.target.checked})} />
          <label htmlFor="instock">In Stock</label>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded md:col-span-2" type="submit">
          {editingId ? 'Update Product' : 'Create Product'}
        </button>
      </form>

      <div className="mt-6 bg-white rounded shadow">
        <div className="p-4 border-b font-medium">Products</div>
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : (
          <ul className="divide-y">
            {products.map(p => (
              <li key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.brand} • ${p.price} • {p.category}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded border" onClick={()=>handleEdit(p)}>Edit</button>
                  <button className="px-3 py-1 rounded border text-red-600" onClick={()=>handleDelete(p.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};


