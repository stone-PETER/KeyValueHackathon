import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const MenuItems = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [loading, setLoading] = useState(false);

  // Fetch items from itemMenu collection
  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(collection(db, "itemMenu"));
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchItems();
  }, [loading]);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new item
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setLoading(true);
    await addDoc(collection(db, "itemMenu"), {
      name: form.name,
      price: Number(form.price),
      description: form.description,
    });
    setForm({ name: "", price: "", description: "" });
    setLoading(false);
  };

  // Start editing an item
  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      price: item.price,
      description: item.description || "",
    });
  };

  // Save edited item
  const handleSave = async (id) => {
    setLoading(true);
    await updateDoc(doc(db, "itemMenu", id), {
      name: form.name,
      price: Number(form.price),
      description: form.description,
    });
    setEditingId(null);
    setForm({ name: "", price: "", description: "" });
    setLoading(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: "", price: "", description: "" });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Menu Items</h2>
      <form
        onSubmit={
          editingId
            ? (e) => {
                e.preventDefault();
                handleSave(editingId);
              }
            : handleAdd
        }
        className="flex flex-col gap-3 mb-6"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Item Name"
          className="border p-2 rounded"
        />
        <input
          name="price"
          value={form.price}
          type="number"
          onChange={handleChange}
          placeholder="Price"
          className="border p-2 rounded"
        />
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 rounded"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {editingId ? "Save" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <h3 className="font-medium mb-2">Existing Items:</h3>
      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.id} className="py-2 flex justify-between items-center">
            <div>
              <div className="font-semibold">{item.name}</div>
              <div className="text-gray-600">₹{item.price}</div>
              <div className="text-gray-500 text-sm">{item.description}</div>
            </div>
            <button
              onClick={() => handleEdit(item)}
              className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuItems;
