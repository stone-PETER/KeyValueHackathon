import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const TodaysOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const snapshot = await getDocs(collection(db, "sales"));
      const todaysOnlineOrders = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (order) =>
            order.source === "online" &&
            order.soldAt &&
            (order.soldAt.toDate
              ? order.soldAt.toDate().toISOString().slice(0, 10)
              : new Date(order.soldAt).toISOString().slice(0, 10)) === today
        );
      setOrders(todaysOnlineOrders);

      // Calculate totals per item
      const totalsObj = {};
      todaysOnlineOrders.forEach((order) => {
        if (!totalsObj[order.mealName]) {
          totalsObj[order.mealName] = 0;
        }
        totalsObj[order.mealName] += Number(order.quantity) || 1;
      });
      setTotals(totalsObj);

      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">
        Today's Online Orders
      </h2>
      {loading ? (
        <div>Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-600">No online orders for today.</div>
      ) : (
        <>
          <table className="w-full text-left mb-6">
            <thead>
              <tr>
                <th className="pr-4">Meal</th>
                <th className="pr-4">User</th>
                <th className="pr-4">Quantity</th>
                <th className="pr-4">Amount</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="pr-4 py-1">{order.mealName}</td>
                  <td className="pr-4 py-1">{order.userId}</td>
                  <td className="pr-4 py-1">{order.quantity}</td>
                  <td className="pr-4 py-1">₹{order.amount}</td>
                  <td className="py-1">
                    {order.soldAt &&
                      (order.soldAt.toDate
                        ? order.soldAt.toDate().toLocaleTimeString()
                        : new Date(order.soldAt).toLocaleTimeString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-4">
            <h3 className="font-medium mb-2">Total Orders Per Item Today:</h3>
            <ul>
              {Object.entries(totals).map(([meal, qty]) => (
                <li key={meal}>
                  <span className="font-semibold">{meal}:</span> {qty}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default TodaysOrders;
