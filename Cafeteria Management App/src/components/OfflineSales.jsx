import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const paymentTypes = ["Cash", "UPI", "Card"];

const OfflineSales = () => {
  const [mealName, setMealName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState(paymentTypes[0]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [todayMeals, setTodayMeals] = useState([]);

  // Fetch today's menu meals
  useEffect(() => {
    const fetchTodayMeals = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const snapshot = await getDocs(collection(db, "cafeteria_menus"));
      const activeMenus = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((menu) => menu.status === "active" && menu.date === today);
      if (activeMenus.length > 0) {
        setTodayMeals(activeMenus[0].items || []);
      } else {
        setTodayMeals([]);
      }
    };
    fetchTodayMeals();
  }, []);

  // Set amount automatically when mealName changes
  useEffect(() => {
    const meal = todayMeals.find((m) => m.name === mealName);
    if (meal) {
      setAmount(meal.price);
    } else {
      setAmount("");
    }
  }, [mealName, todayMeals]);

  const handleSale = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!mealName || !amount || quantity <= 0) {
      setError("Please fill all fields correctly.");
      return;
    }

    try {
      // Add to offline_sales collection
      await addDoc(collection(db, "offline_sales"), {
        mealName,
        quantity: Number(quantity),
        amount: Number(amount),
        paymentType,
        soldAt: new Date(),
      });
      // Also add to sales collection
      await addDoc(collection(db, "sales"), {
        mealName,
        quantity: Number(quantity),
        amount: Number(amount),
        paymentType,
        soldAt: new Date(),
        source: "offline",
      });
      setSuccess(true);
      setMealName("");
      setQuantity(1);
      setAmount("");
      setPaymentType(paymentTypes[0]);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError("Failed to record sale.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">
        Record Offline Sale
      </h2>
      <form onSubmit={handleSale} className="flex flex-col gap-4">
        <select
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Meal</option>
          {todayMeals.map((meal) => (
            <option key={meal.name} value={meal.name}>
              {meal.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantity"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Amount"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded"
          readOnly
        />
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="border p-2 rounded"
        >
          {paymentTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Record Sale
        </button>
        {success && <div className="text-green-600">Sale recorded!</div>}
        {error && <div className="text-red-600">{error}</div>}
      </form>
      {todayMeals.length === 0 && (
        <div className="text-red-600 mt-4">No active menu for today.</div>
      )}
    </div>
  );
};

export default OfflineSales;
