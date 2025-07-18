import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./Authentication";

const Navbar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between shadow">
      <div className="font-bold text-lg">Cafeteria Management</div>
      <div className="flex gap-6">
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
              className={location.pathname === "/dashboard" ? "underline" : ""}
            >
              offline sales
            </Link>
            <Link
              to="/inventory"
              className={location.pathname === "/inventory" ? "underline" : ""}
            >
              Inventory
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/order"
              className={location.pathname === "/" ? "underline" : ""}
            >
              Order Meals
            </Link>
            <Link
              to="/profile"
              className={location.pathname === "/profile" ? "underline" : ""}
            >
              Profile
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
