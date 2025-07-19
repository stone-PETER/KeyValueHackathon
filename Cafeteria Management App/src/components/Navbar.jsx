import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./Authentication";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Navbar = () => {
  const location = useLocation();
  const { isAdmin, setUser, setAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setAdmin(null);
    window.location.href = "/"; // Redirect to home after sign out
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between shadow">
      <div className="font-bold text-lg">Cafeteria Management</div>
      <div className="flex gap-6 items-center">
        {isAdmin ? (
          <>
            <Link
              to="/dashboard"
              className={location.pathname === "/dashboard" ? "underline" : ""}
            >
              Dashboard
            </Link>
            <Link
              to="/offline"
              className={location.pathname === "/offline" ? "underline" : ""}
            >
              Offline Sales
            </Link>
            <Link
              to="/today"
              className={location.pathname === "/analytics" ? "underline" : ""}
            >
              Today
            </Link>
            <Link
              to="/items"
              className={location.pathname === "/analytics" ? "underline" : ""}
            >
              items
            </Link>
            <Link
              to="/analytics"
              className={location.pathname === "/analytics" ? "underline" : ""}
            >
              Analytics
            </Link>
            <button
              onClick={handleSignOut}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/order"
              className={location.pathname === "/order" ? "underline" : ""}
            >
              Order Meals
            </Link>
            <Link
              to="/profile"
              className={location.pathname === "/profile" ? "underline" : ""}
            >
              login
            </Link>
            <button
              onClick={handleSignOut}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
