import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Activity,
  Tag,
  BarChart3
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        <span className="logo-icon">S</span>
        <span>SubStream</span>
      </div>

      <nav className="sidebar-nav">

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>


        <NavLink
          to="/customers"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Users size={20} />
          <span>Customers</span>
        </NavLink>


        <NavLink
          to="/plans"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <CreditCard size={20} />
          <span>Plans</span>
        </NavLink>


        <NavLink
          to="/subscriptions"
          className="nav-item"
        >
          <Receipt size={20} />
          <span>Subscriptions</span>
        </NavLink>


        <NavLink
          to="/payments"
          className="nav-item"
        >
          <Receipt size={20} />
          <span>Payments</span>
        </NavLink>


        <NavLink
          to="/usage"
          className="nav-item"
        >
          <Activity size={20} />
          <span>Usage</span>
        </NavLink>


        <NavLink
          to="/discounts"
          className="nav-item"
        >
          <Tag size={20} />
          <span>Discounts</span>
        </NavLink>


        <NavLink
          to="/reports"
          className="nav-item"
        >
          <BarChart3 size={20} />
          <span>Reports</span>
        </NavLink>

      </nav>


      <div className="sidebar-bottom">
        <p>Subscription Management</p>
        <small>Admin Panel</small>
      </div>

    </aside>
  );
}

export default Sidebar;