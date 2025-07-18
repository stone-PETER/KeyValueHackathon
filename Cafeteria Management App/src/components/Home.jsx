import React from "react";
import { Link } from "react-router-dom";

const Home = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <h1 className="text-4xl font-bold mb-4 text-blue-700">
      Welcome to Cafeteria Management
    </h1>
    <p className="mb-8 text-lg text-gray-700 text-center max-w-xl">
      Order your meals, manage your profile, or sign in as an admin to access
      the dashboard and inventory.
    </p>
    <div className="flex gap-6">
      <Link
        to="/order"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700"
      >
        Order Meals
      </Link>
      <Link
        to="/profile"
        className="bg-gray-200 text-blue-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-300"
      >
        Sign In / Profile
      </Link>
    </div>
  </div>
);

export default Home;
