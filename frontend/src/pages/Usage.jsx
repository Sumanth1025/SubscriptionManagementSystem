import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";

function Usage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [usage, setUsage] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUsage, setEditingUsage] = useState(null);

  const [form, setForm] = useState({
    subscription_id: "",
    usage_date: "",
    usage_amount: ""
  });

  const loadUsage = async () => {
    const response = await fetch(`${API_URL}/api/usage`);
    const data = await response.json();
    setUsage(data);
  };

  const loadSubscriptions = async () => {
    const response = await fetch(
      `${API_URL}/api/usage-subscriptions`
    );

    const data = await response.json();
    setSubscriptions(data);
  };

  useEffect(() => {
    loadUsage();
    loadSubscriptions();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const openAddForm = () => {
    setEditingUsage(null);

    setForm({
      subscription_id: "",
      usage_date: "",
      usage_amount: ""
    });

    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingUsage(item);

    setForm({
      subscription_id: item.subscription_id,
      usage_date: item.usage_date?.slice(0, 10),
      usage_amount: item.usage_amount
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUsage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

   const url = editingUsage
  ? `${API_URL}/api/usage/${editingUsage.usage_id}`
  : `${API_URL}/api/usage`;

    const method = editingUsage ? "PUT" : "POST";

    await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        subscription_id: Number(form.subscription_id),
        usage_date: form.usage_date,
        usage_amount: Number(form.usage_amount)
      })
    });

    closeForm();
    loadUsage();
  };

  const handleDelete = async (usageId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this usage record?"
    );

    if (!confirmDelete) {
      return;
    }

    await fetch(
      `${API_URL}/api/usage/${usageId}`,
      {
        method: "DELETE"
      }
    );

    loadUsage();
  };

  const filteredUsage = usage.filter((item) =>
    String(item.usage_id).includes(search) ||
    String(item.subscription_id).includes(search) ||
    item.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    item.plan_name.toLowerCase().includes(search.toLowerCase()) ||
    String(item.usage_date).includes(search)
  );

  return (
    <div className="page usage-page">

      <div className="page-header">
        <div>
          <h1>Usage Details</h1>
          <p>Track subscription usage activity</p>
        </div>

        <button className="primary-btn" onClick={openAddForm}>
          <Plus size={18} />
          Add Usage
        </button>
      </div>

     {showForm && (
  <div className="form-card">

    <div className="form-header">
      <h2>
        {editingUsage ? "Edit Usage" : "Add Usage"}
      </h2>

      <button
        type="button"
        className="icon-btn"
        onClick={closeForm}
      >
        <X size={20} />
      </button>
    </div>

    <form onSubmit={handleSubmit}>

      <div className="form-grid">

        <div className="form-group">

          <label>Subscription</label>

          <select
            name="subscription_id"
            value={form.subscription_id}
            onChange={handleChange}
            required
          >
            <option value="">
              Select subscription
            </option>

            {subscriptions.map((subscription) => (
              <option
                key={subscription.subscription_id}
                value={subscription.subscription_id}
              >
                #{subscription.subscription_id} -{" "}
                {subscription.customer_name} -{" "}
                {subscription.plan_name}
              </option>
            ))}
          </select>

        </div>

        <div className="form-group">

          <label>Usage Date</label>

          <input
            type="date"
            name="usage_date"
            value={form.usage_date}
            onChange={handleChange}
            required
          />

        </div>

        <div className="form-group">

          <label>Usage Amount</label>

          <input
            type="number"
            name="usage_amount"
            value={form.usage_amount}
            onChange={handleChange}
            min="0"
            placeholder="Enter usage amount"
            required
          />

        </div>

      </div>

      <div className="form-actions">

        <button
          type="button"
          className="secondary-btn"
          onClick={closeForm}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="primary-btn"
        >
          {editingUsage ? "Update Usage" : "Add Usage"}
        </button>

      </div>

    </form>

  </div>
)}

      <div className="table-card">

        <div className="table-toolbar">

          <div>
            <h2>Usage Records</h2>
            <p>{filteredUsage.length} records found</p>
          </div>

          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search usage..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>

        <div className="table-container">

  <table className="usage-table">

    <thead>
      <tr>
        <th>ID</th>
        <th>Subscription</th>
        <th>Customer</th>
        <th>Plan</th>
        <th>Usage Date</th>
        <th>Usage Amount</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>

      {filteredUsage.length === 0 ? (
        <tr>
          <td colSpan="7" className="empty-state">
            No usage records found
          </td>
        </tr>
      ) : (
        filteredUsage.map((item) => (
          <tr key={item.usage_id}>

            <td className="usage-id">
              #{item.usage_id}
            </td>

            <td>
              #{item.subscription_id}
            </td>

            <td className="customer-name">
              {item.customer_name}
            </td>

            <td className="plan-name">
              {item.plan_name}
            </td>

            <td className="usage-date">
              {new Date(item.usage_date).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                }
              )}
            </td>

            <td>
              <span className="usage-badge">
                {item.usage_amount}
              </span>
            </td>

            <td>

              <div className="action-buttons">

                <button
                  className="edit-btn"
                  onClick={() => openEditForm(item)}
                  title="Edit usage"
                >
                  <Pencil size={16} />
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(item.usage_id)
                  }
                  title="Delete usage"
                >
                  <Trash2 size={16} />
                </button>

              </div>

            </td>

          </tr>
        ))
      )}

    </tbody>

  </table>

</div>

      </div>

    </div>
  );
}

export default Usage;