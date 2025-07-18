import React, { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

// ---- Example Data (replace with API in prod) ----
const initialInventory = [
  { id: 1, name: "Chicken Breast", unit: "kg", stock: 12, predictedNeed: 15, trend: [11,12,14,13,15] },
  { id: 2, name: "Rice", unit: "kg", stock: 38, predictedNeed: 32, trend: [34,35,36,38,32] },
  { id: 3, name: "Tomato", unit: "kg", stock: 4, predictedNeed: 8, trend: [6,8,7,5,8] },
  { id: 4, name: "Cheese", unit: "kg", stock: 6, predictedNeed: 4, trend: [3,4,5,5,4] },
];

function statusColor(stock, predictedNeed) {
  if (stock === 0) return "bg-red-500 text-white";
  if (stock < predictedNeed) return "bg-yellow-400 text-yellow-900";
  if (stock - predictedNeed < 3) return "bg-orange-300 text-orange-900";
  return "bg-green-100 text-green-800";
}

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState(initialInventory);

  // Simulate updating stock (new delivery or usage)
  const updateStock = (id, diff) => {
    setInventory(inv =>
      inv.map(item =>
        item.id === id ? { ...item, stock: Math.max(item.stock + diff, 0) } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Kitchen Inventory & Ingredient Predictions</h1>
        <p className="text-gray-600 mb-6">
          Real-time stock levels, tomorrow’s predicted need, and alerts to minimize food wastage or shortages.
        </p>
        <table className="w-full text-left text-base">
          <thead>
            <tr className="border-b text-gray-700">
              <th className="p-2">Ingredient</th>
              <th className="p-2">Current Stock</th>
              <th className="p-2">Predicted Need</th>
              <th className="p-2">Trend (Last 5d)</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="p-2">{item.name}</td>
                <td className="p-2 font-bold">{item.stock} <span className="text-xs text-gray-400">{item.unit}</span></td>
                <td className="p-2">{item.predictedNeed} <span className="text-xs text-gray-400">{item.unit}</span></td>
                <td className="p-2">
                  <div className="flex gap-1">
                    {item.trend.map((v, idx) =>
                      <span key={idx} className="inline-block w-6 text-center text-sm rounded bg-gray-100">{v}</span>
                    )}
                  </div>
                </td>
                <td className="p-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColor(item.stock, item.predictedNeed)}`}>
                    {item.stock === 0 ? "Critical"
                      : item.stock < item.predictedNeed ? "Low"
                      : item.stock - item.predictedNeed < 3 ? "Caution"
                      : "OK"}
                    {item.stock < item.predictedNeed ? (
                      <AlertCircle className="ml-2 w-4 h-4" />
                    ) : (
                      <CheckCircle className="ml-2 w-4 h-4" />
                    )}
                  </span>
                  {item.stock < item.predictedNeed && (
                    <div className="text-xs text-red-600 mt-1">Shortage Alert: Restock needed!</div>
                  )}
                  {(item.stock - item.predictedNeed >= 7) && (
                    <div className="text-xs text-green-600 mt-1">Sufficient stock</div>
                  )}
                </td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => updateStock(item.id, +1)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    title="Add Stock"
                  >+</button>
                  <button
                    onClick={() => updateStock(item.id, -1)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    title="Use Ingredient"
                    disabled={item.stock === 0}
                  >-</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 text-sm text-gray-500">
          <strong>Tip:</strong> Red/yellow highlights warn staff before shortages occur. All predictions use last five days’ trends.
        </div>
      </div>
    </div>
  );
}
