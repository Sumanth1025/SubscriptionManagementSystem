import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";

function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [plans, setPlans] = useState([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  const [form, setForm] = useState({
    plan_id: "",
    discount_percentage: "",
    valid_from: "",
    valid_to: ""
  });

  const loadDiscounts = async () => {
    const response = await fetch(
      "http://127.0.0.1:5000/api/discounts"
    );

    const data = await response.json();

    setDiscounts(data);
  };

  const loadPlans = async () => {
    const response = await fetch(
      "http://127.0.0.1:5000/api/discount-plans"
    );

    const data = await response.json();

    setPlans(data);
  };

  useEffect(() => {
    loadDiscounts();
    loadPlans();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const openAddForm = () => {
    setEditingDiscount(null);

    setForm({
      plan_id: "",
      discount_percentage: "",
      valid_from: "",
      valid_to: ""
    });

    setShowForm(true);
  };

  const openEditForm = (discount) => {
    setEditingDiscount(discount);

    setForm({
      plan_id: discount.plan_id,
      discount_percentage: discount.discount_percentage,
      valid_from: String(discount.valid_from).slice(0, 10),
      valid_to: String(discount.valid_to).slice(0, 10)
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDiscount(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingDiscount
      ? `http://127.0.0.1:5000/api/discounts/${editingDiscount.discount_id}`
      : "http://127.0.0.1:5000/api/discounts";

    const method = editingDiscount ? "PUT" : "POST";

    await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        plan_id: Number(form.plan_id),
        discount_percentage: Number(form.discount_percentage),
        valid_from: form.valid_from,
        valid_to: form.valid_to
      })
    });

    closeForm();

    loadDiscounts();
  };

  const handleDelete = async (discountId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this discount?"
    );

    if (!confirmDelete) {
      return;
    }

    await fetch(
      `http://127.0.0.1:5000/api/discounts/${discountId}`,
      {
        method: "DELETE"
      }
    );

    loadDiscounts();
  };

  const filteredDiscounts = discounts.filter((discount) =>
    String(discount.discount_id).includes(search) ||
    String(discount.plan_id).includes(search) ||
    discount.plan_name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  return (
    <div className="page discounts-page">

      <div className="page-header">

        <div>
          <h1>Discounts</h1>
          <p>Manage plan discounts and validity periods</p>
        </div>

        <button
          className="primary-btn"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Discount
        </button>

      </div>

      {showForm && (
  <div className="form-card">

    <div className="form-header">

      <h2>
        {editingDiscount
          ? "Edit Discount"
          : "Add Discount"}
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

          <label>Plan</label>

          <select
            name="plan_id"
            value={form.plan_id}
            onChange={handleChange}
            required
          >
            <option value="">
              Select plan
            </option>

            {plans.map((plan) => (
              <option
                key={plan.plan_id}
                value={plan.plan_id}
              >
                {plan.plan_name} - ₹{plan.price}
              </option>
            ))}

          </select>

        </div>

        <div className="form-group">

          <label>Discount Percentage</label>

          <input
            type="number"
            name="discount_percentage"
            value={form.discount_percentage}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.01"
            placeholder="Enter percentage"
            required
          />

        </div>

        <div className="form-group">

          <label>Valid From</label>

          <input
            type="date"
            name="valid_from"
            value={form.valid_from}
            onChange={handleChange}
            required
          />

        </div>

        <div className="form-group">

          <label>Valid To</label>

          <input
            type="date"
            name="valid_to"
            value={form.valid_to}
            onChange={handleChange}
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
          {editingDiscount
            ? "Update Discount"
            : "Add Discount"}
        </button>

      </div>

    </form>

  </div>
)}

      <div className="table-card">

        <div className="table-toolbar">

          <div>
            <h2>Discount Records</h2>
            <p>
              {filteredDiscounts.length} records found
            </p>
          </div>

          <div className="search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search discounts..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>PLAN</th>
                <th>PRICE</th>
                <th>DISCOUNT</th>
                <th>VALID FROM</th>
                <th>VALID TO</th>
                <th>ACTIONS</th>
              </tr>

            </thead>

            <tbody>

              {filteredDiscounts.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-state"
                  >
                    No discount records found
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((discount) => (
                  <tr key={discount.discount_id}>

                    <td>
                      #{discount.discount_id}
                    </td>

                    <td>
                      {discount.plan_name}
                    </td>

                    <td>
                      ₹{Number(discount.price).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span className="status-badge">
                        {discount.discount_percentage}%
                      </span>
                    </td>

                    <td>
                      {formatDate(discount.valid_from)}
                    </td>

                    <td>
                      {formatDate(discount.valid_to)}
                    </td>

                    <td>

                      <div className="action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            openEditForm(discount)
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(
                              discount.discount_id
                            )
                          }
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

export default Discounts;