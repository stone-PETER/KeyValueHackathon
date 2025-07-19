import { BrowserRouter, Routes, Route } from "react-router-dom";
import MealOrdering from "./components/MealOrdering2";
import Authentication, { AuthProvider } from "./components/Authentication";
import Dashboard from "./components/CafeteriaManagement";
import KitchenDashboard from "./components/kitchen";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import "./App.css";
import OfflineSales from "./components/OfflineSales";
import Analytics from "./components/analytics";
import MenuItems from "./components/MenuItems";
import TodaysOrders from "./components/todaysOrders";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/offline" element={<OfflineSales />} />
          <Route path="/items" element={<MenuItems/>} />
          <Route path="/today" element={<TodaysOrders />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/order" element={<MealOrdering />} />
          <Route path="/profile" element={<Authentication />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kitchen" element={<KitchenDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
