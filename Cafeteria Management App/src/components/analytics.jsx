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
  const [onlinePrediction, setOnlinePrediction] = useState(null);
  const [offlinePrediction, setOfflinePrediction] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [itemPredictions, setItemPredictions] = useState([]);

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

      // Prepare data for regression: x = day index, y = sales, for each type
      const days = Array.from(
        new Set([...Object.keys(offlineDaily), ...Object.keys(onlineDaily)])
      ).sort();
      const x = days.map((_, idx) => idx + 1); // day indices
      const yOnline = days.map((day) => onlineDaily[day] || 0);
      const yOffline = days.map((day) => offlineDaily[day] || 0);

      // Prepare daily stats for display
      const stats = days.map((day) => ({
        date: day,
        offline: offlineDaily[day] || 0,
        online: onlineDaily[day] || 0,
      }));
      setDailyStats(stats);

      // Predict next day's online sales based on previous online sales
      if (x.length > 1) {
        const { slope, intercept } = linearRegression(x, yOnline);
        const nextDay = x.length + 1;
        const predictedOnline = slope * nextDay + intercept;
        setOnlinePrediction({
          slope,
          intercept,
          predictedOnline: Math.max(0, Math.round(predictedOnline)),
        });

        // Predict next day's offline sales based on previous offline sales
        const { slope: offSlope, intercept: offIntercept } = linearRegression(
          x,
          yOffline
        );
        const predictedOffline = offSlope * nextDay + offIntercept;
        setOfflinePrediction({
          offSlope,
          offIntercept,
          predictedOffline: Math.max(0, Math.round(predictedOffline)),
        });
      }

      // --- Item-wise prediction ---
      // Collect all unique item names from both sales collections
      const allItems = Array.from(
        new Set([
          ...online.map((s) => s.mealName),
          ...offline.map((s) => s.mealName),
        ])
      ).filter(Boolean);

      const itemPreds = [];

      for (const item of allItems) {
        // Aggregate daily sales for this item
        const itemOnline = online.filter((s) => s.mealName === item);
        const itemOffline = offline.filter((s) => s.mealName === item);

        // Get all days for this item
        const itemDays = Array.from(
          new Set([
            ...itemOnline.map((s) => s.date.toISOString().slice(0, 10)),
            ...itemOffline.map((s) => s.date.toISOString().slice(0, 10)),
          ])
        ).sort();

        // Prepare daily sales arrays
        const xItem = itemDays.map((_, idx) => idx + 1);
        const yOnlineItem = itemDays.map((day) =>
          itemOnline
            .filter((s) => s.date.toISOString().slice(0, 10) === day)
            .reduce((sum, s) => sum + (s.quantity || 1), 0)
        );
        const yOfflineItem = itemDays.map((day) =>
          itemOffline
            .filter((s) => s.date.toISOString().slice(0, 10) === day)
            .reduce((sum, s) => sum + (s.quantity || 1), 0)
        );

        // Predict next day's sales for this item (online and offline)
        let predOnline = null;
        let predOffline = null;
        if (xItem.length > 1) {
          const { slope, intercept } = linearRegression(xItem, yOnlineItem);
          predOnline = Math.max(
            0,
            Math.round(slope * (xItem.length + 1) + intercept)
          );
          const { slope: offSlope, intercept: offIntercept } = linearRegression(
            xItem,
            yOfflineItem
          );
          predOffline = Math.max(
            0,
            Math.round(offSlope * (xItem.length + 1) + offIntercept)
          );
        }

        itemPreds.push({
          item,
          predOnline,
          predOffline,
        });
      }
      setItemPredictions(itemPreds);
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
      {onlinePrediction && (
        <div className="bg-blue-50 p-4 rounded mb-4">
          <h4 className="font-semibold mb-2">Online Sales Prediction</h4>
          <p>
            Based on regression, predicted online sales for next day:{" "}
            <span className="font-bold text-blue-700">
              ₹{onlinePrediction.predictedOnline}
            </span>
          </p>
        </div>
      )}
      {offlinePrediction && (
        <div className="bg-green-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Offline Sales Prediction</h4>
          <p>
            Based on regression, predicted offline sales for next day:{" "}
            <span className="font-bold text-green-700">
              ₹{offlinePrediction.predictedOffline}
            </span>
          </p>
        </div>
      )}
      {itemPredictions.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded mt-4">
          <h4 className="font-semibold mb-2">
            Predicted Item Sales (Next Day)
          </h4>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="pr-4">Item</th>
                <th className="pr-4">Online Predicted Qty</th>
                <th>Offline Predicted Qty</th>
              </tr>
            </thead>
            <tbody>
              {itemPredictions.map((pred, idx) => (
                <tr key={idx}>
                  <td className="pr-4 py-1">{pred.item}</td>
                  <td className="pr-4 py-1">
                    {pred.predOnline !== null ? pred.predOnline : "-"}
                  </td>
                  <td className="py-1">
                    {pred.predOffline !== null ? pred.predOffline : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Analytics;
