import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Simple linear regression function
function linearRegression(x, y) {
  const n = x.length;
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  const num = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
  const den = x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0);
  const slope = num / den;
  const intercept = yMean - slope * xMean;
  return { slope, intercept };
}

const Analytics = () => {
  const [offlineSales, setOfflineSales] = useState([]);
  const [onlineSales, setOnlineSales] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch offline sales
      const offlineSnap = await getDocs(collection(db, "offline_sales"));
      const offline = offlineSnap.docs.map((doc) => ({
        ...doc.data(),
        date: doc.data().soldAt?.toDate
          ? doc.data().soldAt.toDate()
          : new Date(doc.data().soldAt),
      }));

      // Fetch online sales
      const onlineSnap = await getDocs(collection(db, "sales"));
      const online = onlineSnap.docs
        .map((doc) => doc.data())
        .filter((sale) => sale.source === "online")
        .map((sale) => ({
          ...sale,
          date: sale.soldAt?.toDate
            ? sale.soldAt.toDate()
            : new Date(sale.soldAt),
        }));

      setOfflineSales(offline);
      setOnlineSales(online);

      // Aggregate by day
      const getDailyTotals = (salesArr) => {
        const daily = {};
        salesArr.forEach((sale) => {
          const day = sale.date.toISOString().slice(0, 10);
          daily[day] = (daily[day] || 0) + (sale.amount || 0);
        });
        return daily;
      };

      const offlineDaily = getDailyTotals(offline);
      const onlineDaily = getDailyTotals(online);

      // Prepare data for regression: x = offline, y = online, by day
      const days = Array.from(
        new Set([...Object.keys(offlineDaily), ...Object.keys(onlineDaily)])
      ).sort();
      const x = days.map((day) => offlineDaily[day] || 0);
      const y = days.map((day) => onlineDaily[day] || 0);

      // Prepare daily stats for display
      const stats = days.map((day) => ({
        date: day,
        offline: offlineDaily[day] || 0,
        online: onlineDaily[day] || 0,
      }));
      setDailyStats(stats);

      if (x.length > 1 && y.length > 1) {
        const { slope, intercept } = linearRegression(x, y);
        // Predict online sales for next day based on today's offline sales
        const todayOffline = x[x.length - 1];
        const predictedOnline = slope * todayOffline + intercept;
        setPrediction({
          slope,
          intercept,
          todayOffline,
          predictedOnline: Math.max(0, Math.round(predictedOnline)),
        });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Sales Analytics</h2>
      <div className="mb-4">
        <h3 className="font-medium mb-2">Daily Online & Offline Sales:</h3>
        <table className="w-full text-left mb-4">
          <thead>
            <tr>
              <th className="pr-4">Date</th>
              <th className="pr-4">Offline Sales (₹)</th>
              <th>Online Sales (₹)</th>
            </tr>
          </thead>
          <tbody>
            {dailyStats.map((stat, idx) => (
              <tr key={idx} className="border-b">
                <td className="pr-4 py-1">{stat.date}</td>
                <td className="pr-4 py-1">{stat.offline}</td>
                <td className="py-1">{stat.online}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-4">
        <h3 className="font-medium mb-2">Offline Sales (last 7 days):</h3>
        <ul>
          {offlineSales.slice(-7).map((sale, idx) => (
            <li key={idx}>
              {sale.date.toLocaleDateString()} - ₹{sale.amount}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-medium mb-2">Online Sales (last 7 days):</h3>
        <ul>
          {onlineSales.slice(-7).map((sale, idx) => (
            <li key={idx}>
              {sale.date.toLocaleDateString()} - ₹{sale.amount}
            </li>
          ))}
        </ul>
      </div>
      {prediction && (
        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Prediction</h4>
          <p>
            Based on regression, if today's offline sales are ₹
            {prediction.todayOffline},<br />
            predicted online sales for next day:{" "}
            <span className="font-bold text-blue-700">
              ₹{prediction.predictedOnline}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
