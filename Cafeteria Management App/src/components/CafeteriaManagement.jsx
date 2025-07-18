import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

function MealAdmin() {
  const [meal, setMeal] = useState({
    name: "",
    price: "",
    description: "",
    quantity: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [launchDate, setLaunchDate] = useState("");
  const [launchTime, setLaunchTime] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [previousMenus, setPreviousMenus] = useState([]);
  const [scheduledMenus, setScheduledMenus] = useState([]);
  const [activateSuccess, setActivateSuccess] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]); // For dropdown

  useEffect(() => {
    const fetchMenus = async () => {
      const snapshot = await getDocs(collection(db, "cafeteria_menus"));
      const allMenus = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPreviousMenus(allMenus);
      setScheduledMenus(allMenus.filter((menu) => menu.status === "scheduled"));

      // Collect all unique items from all menus for dropdown
      const items = [];
      allMenus.forEach((menu) => {
        (menu.items || []).forEach((item) => {
          if (!items.find((i) => i.name === item.name)) {
            items.push(item);
          }
        });
      });
      setAllMenuItems(items);
    };
    fetchMenus();
  }, [success, activateSuccess]);

  const handleMealChange = (e) => {
    const { name, value } = e.target;
    // If meal name is changed and matches an item, auto-fill price and description
    if (name === "name") {
      const selected = allMenuItems.find((item) => item.name === value);
      if (selected) {
        setMeal({
          ...meal,
          name: selected.name,
          price: selected.price,
          description: selected.description || "",
        });
        return;
      }
    }
    setMeal({ ...meal, [name]: value });
  };

  const addMealToMenu = () => {
    if (!meal.name || !meal.price || !meal.quantity) return;
    setMenuItems([...menuItems, meal]);
    setMeal({ name: "", price: "", description: "", quantity: "" });
  };

  const scheduleMenu = async () => {
    if (!launchDate || !launchTime || menuItems.length === 0) return;
    setSaving(true);
    await addDoc(collection(db, "cafeteria_menus"), {
      date: launchDate,
      launchTime: new Date(`${launchDate}T${launchTime}`),
      items: menuItems,
      status: "scheduled",
    });
    setSaving(false);
    setSuccess(true);
    setMenuItems([]);
    setTimeout(() => setSuccess(false), 3000);
  };

  const reuseMenu = (menu) => {
    setMenuItems(menu.items);
    setLaunchDate(menu.date);
  };

  const activateMenu = async (menuId) => {
    await updateDoc(doc(db, "cafeteria_menus", menuId), { status: "active" });
    setActivateSuccess("Menu activated!");
    setTimeout(() => setActivateSuccess(""), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">
        Create & Schedule Daily Menu
      </h2>

      <div className="flex flex-col gap-2 mb-4">
        <select
          name="name"
          value={meal.name}
          onChange={handleMealChange}
          className="border p-2 rounded"
        >
          <option value="">Select Meal Name</option>
          {allMenuItems.map((item, idx) => (
            <option key={idx} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          name="price"
          value={meal.price}
          type="number"
          onChange={handleMealChange}
          placeholder="Price"
          className="border p-2 rounded"
        />
        <input
          name="description"
          value={meal.description}
          onChange={handleMealChange}
          placeholder="Description"
          className="border p-2 rounded"
        />
        <input
          name="quantity"
          value={meal.quantity}
          type="number"
          onChange={handleMealChange}
          placeholder="Quantity"
          className="border p-2 rounded"
        />
        <button
          onClick={addMealToMenu}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Meal to Menu
        </button>
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Menu Items:</h3>
        <ul className="list-disc ml-4">
          {menuItems.map((item, idx) => (
            <li key={idx}>
              {item.name} - ${item.price} (Qty: {item.quantity})
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={launchDate}
          onChange={(e) => setLaunchDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={launchTime}
          onChange={(e) => setLaunchTime(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <button
        onClick={scheduleMenu}
        disabled={saving}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? "Scheduling..." : "Schedule Menu"}
      </button>
      {success && (
        <span className="text-green-600 ml-4">
          Menu scheduled successfully!
        </span>
      )}

      <hr className="my-4" />

      <h3 className="font-medium mb-2">Scheduled Menus:</h3>
      <ul className="list-disc ml-4 max-h-32 overflow-y-scroll mb-4">
        {scheduledMenus.length === 0 && (
          <li className="text-gray-500">No scheduled menus.</li>
        )}
        {scheduledMenus.map((menu) => (
          <li key={menu.id} className="mb-1 flex items-center gap-2">
            {menu.date} - {menu.items.length} items
            <button
              onClick={() => activateMenu(menu.id)}
              className="ml-2 text-green-700 underline"
            >
              Activate
            </button>
          </li>
        ))}
      </ul>
      {activateSuccess && (
        <div className="text-green-600 mb-2">{activateSuccess}</div>
      )}

      <h3 className="font-medium mb-2">Reuse Previous Menus:</h3>
      <ul className="list-disc ml-4 max-h-32 overflow-y-scroll">
        {previousMenus.map((menu) => (
          <li key={menu.id} className="mb-1">
            {menu.date} - {menu.items.length} items
            <button
              onClick={() => reuseMenu(menu)}
              className="ml-2 text-blue-600 hover:underline"
            >
              Reuse
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MealAdmin;
