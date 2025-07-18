import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { CheckCircle } from "lucide-react";
import { useAuth } from "./Authentication"; // Use global auth

const MealBooking = () => {
  const { user, loading: authLoading } = useAuth(); // Add loading from context
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const fetchMeals = async () => {
      const snapshot = await getDocs(collection(db, "cafeteria_menus"));
      const activeMeals = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((menu) => menu.status === "active");
      setMeals(
        activeMeals.flatMap((menu) =>
          menu.items.map((item) => ({ ...item, menuId: menu.id }))
        )
      );
      setLoading(false);
    };

    fetchMeals();
  }, []);

  const bookMeal = async (meal, index) => {
    if (meal.quantity <= 0 || !user) return;

    // Fetch the latest token number for this meal from Firestore
    const tokensSnapshot = await getDocs(collection(db, "meal_tokens"));
    // Filter tokens for this meal and menuId
    const mealTokens = tokensSnapshot.docs
      .map((doc) => doc.data())
      .filter((t) => t.mealName === meal.name && t.menuId === meal.menuId);

    // Find the highest token number for this meal
    let lastTokenNumber = 0;
    if (mealTokens.length > 0) {
      lastTokenNumber = Math.max(
        ...mealTokens
          .map((t) => parseInt(t.tokenNumber, 10))
          .filter((n) => !isNaN(n))
      );
    }
    const nextTokenNumber = lastTokenNumber + 1;

    await addDoc(collection(db, "meal_tokens"), {
      token: `TOKEN-${nextTokenNumber}`,
      tokenNumber: nextTokenNumber,
      userId: user.uid || user.id,
      mealName: meal.name,
      menuId: meal.menuId,
      bookedAt: new Date(),
    });

    // Add sales data to sales collection
    await addDoc(collection(db, "sales"), {
      mealName: meal.name,
      menuId: meal.menuId,
      userId: user.uid || user.id,
      amount: Number(meal.price),
      quantity: 1,
      source: "online",
      soldAt: new Date(),
    });

    const menuRef = doc(db, "cafeteria_menus", meal.menuId);

    meals[index].quantity -= 1;
    await updateDoc(menuRef, { items: meals });

    setTokens([
      ...tokens,
      { mealName: meal.name, token: `TOKEN-${nextTokenNumber}` },
    ]);
  };

  if (authLoading || loading) return <div>Loading meals...</div>;
  if (!user)
    return (
      <div className="text-center mt-8 text-red-600">
        Please sign in to book meals.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Today's Meals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.map((meal, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold">{meal.name}</h2>
            <p className="text-gray-600">${meal.price}</p>
            <p className="text-sm text-gray-500 mb-2">{meal.description}</p>
            <p className="mb-2">Available: {meal.quantity}</p>
            <button
              disabled={meal.quantity <= 0}
              onClick={() => bookMeal(meal, index)}
              className={`w-full py-2 rounded ${
                meal.quantity <= 0
                  ? "bg-gray-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {meal.quantity <= 0 ? "Sold Out" : "Book Meal"}
            </button>
          </div>
        ))}
      </div>

      {tokens.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Your Meal Tokens</h3>
          <ul className="space-y-2">
            {tokens.map((t, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={18} />
                <span>
                  {t.mealName}: <strong>{t.token}</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MealBooking;
