import React, { useState } from "react";

// Example mock data
const initialOrders = [
  { id: 1, meal: "Paneer Wrap", qty: 4, time: "10:25 AM", status: "Pending" },
  { id: 2, meal: "Chicken Biryani", qty: 2, time: "10:30 AM", status: "Pending" },
  { id: 3, meal: "Fruit Salad", qty: 3, time: "10:45 AM", status: "In Progress" },
];

const initialMenu = [
  { id: 1, name: "Paneer Wrap", available: true },
  { id: 2, name: "Chicken Biryani", available: true },
  { id: 3, name: "Fruit Salad", available: true },
  { id: 4, name: "Veg Burger", available: false },
];

function KitchenDashboard() {
  const [orders, setOrders] = useState(initialOrders);
  const [menu, setMenu] = useState(initialMenu);

  // Update order status
  const updateStatus = (orderId, newStatus) => {
    setOrders(orders =>
      orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Toggle menu availability
  const toggleMenu = (mealId) => {
    setMenu(menu =>
      menu.map(item =>
        item.id === mealId ? { ...item, available: !item.available } : item
      )
    );
  };

  // Edit menu item (example: renaming meal)
  const editMenuName = (mealId, newName) => {
    setMenu(menu =>
      menu.map(item =>
        item.id === mealId ? { ...item, name: newName } : item
      )
    );
  };

  // UI for each order row
  const orderRow = (order) => (
    <tr key={order.id} className="border-b text-lg">
      <td className="py-2">{order.meal}</td>
      <td>{order.qty}</td>
      <td>{order.time}</td>
      <td>
        <span className={
          order.status === "Pending"
            ? "bg-yellow-200 text-yellow-900 px-2 py-1 rounded"
            : order.status === "In Progress"
            ? "bg-blue-200 text-blue-900 px-2 py-1 rounded"
            : "bg-green-200 text-green-900 px-2 py-1 rounded"
        }>
          {order.status}
        </span>
      </td>
      <td>
        {order.status === "Pending" && (
          <button
            className="bg-blue-500 text-white rounded px-3 py-1 mr-2"
            onClick={() => updateStatus(order.id, "In Progress")}
          >
            Start
          </button>
        )}
        {order.status === "In Progress" && (
          <button
            className="bg-green-600 text-white rounded px-3 py-1"
            onClick={() => updateStatus(order.id, "Completed")}
          >
            Mark Ready
          </button>
        )}
      </td>
    </tr>
  );

  // UI for menu management
  const menuRow = (item) => (
    <tr key={item.id} className="border-b text-lg">
      <td>
        <input
          type="text"
          value={item.name}
          className="bg-gray-50 border px-2 py-1 rounded"
          onChange={e => editMenuName(item.id, e.target.value)}
        />
      </td>
      <td>
        <button
          className={
            item.available
              ? "bg-green-500 text-white px-3 py-1 rounded"
              : "bg-gray-400 text-white px-3 py-1 rounded"
          }
          onClick={() => toggleMenu(item.id)}
        >
          {item.available ? "Available" : "Out of Stock"}
        </button>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col md:flex-row gap-8">
      {/* Orders Panel */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Incoming Meal Orders</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-600 text-lg border-b">
              <th className="py-2">Meal</th>
              <th>Qty</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{orders.filter(o => o.status !== "Completed").map(orderRow)}</tbody>
        </table>
      </div>

      {/* Menu Management Panel */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Menu Management</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-600 text-lg border-b">
              <th className="py-2">Meal</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>{menu.map(menuRow)}</tbody>
        </table>
      </div>
    </div>
  );
}

export default KitchenDashboard;
