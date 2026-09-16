import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Plans from "./pages/Plans";
import Subscriptions from "./pages/Subscriptions";
import Payments from "./pages/Payments";
import Usage from "./pages/Usage";
import Discounts from "./pages/Discounts";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>

      <div className="app">

        <Sidebar />

        <main className="main-content">

          <Topbar />

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/customers"
              element={<Customers />}
            />
          
            <Route
              path="/plans"
              element={<Plans />}
            />
  
            <Route
              path="/subscriptions"
              element={<Subscriptions />}
            />

            <Route
              path="/payments"
              element={<Payments />}
            />
            
            <Route 
            path="/usage" 
            element={<Usage />}
            />
            <Route path="/discounts" element={<Discounts />} />
            <Route
  path="/reports"
  element={<Reports />}
/>
            </Routes>
        </main>

      </div>

    </BrowserRouter>
  );
}

export default App;