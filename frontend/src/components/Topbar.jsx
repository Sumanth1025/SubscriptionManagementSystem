import { Search, Bell, UserCircle } from "lucide-react";

function Topbar() {
  return (
    <header className="topbar">

      <div>
        <h2>Dashboard</h2>
        <p>Welcome back, Admin</p>
      </div>

      <div className="topbar-actions">

        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search..."
          />
        </div>

        <button className="icon-button">
          <Bell size={20} />
        </button>

        <div className="profile">
          <UserCircle size={34} />
          <div>
            <strong>Admin</strong>
            <small>Administrator</small>
          </div>
        </div>

      </div>

    </header>
  );
}

export default Topbar;