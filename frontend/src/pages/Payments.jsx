import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search
} from "lucide-react";

function Payments() {

  const API_URL = import.meta.env.VITE_API_URL;
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [form, setForm] = useState({
    subscription_id: "",
    amount: "",
    payment_date: "",
    payment_method: "UPI",
    status: "completed"
  });


  const loadPayments = () => {

    fetch(`${API_URL}/api/payments`)
      .then((response) => response.json())
      .then((data) => {
        setPayments(data);
      })
      .catch((error) => {
        console.error(error);
      });

  };


  const loadSubscriptions = () => {

    fetch(`${API_URL}/api/payment-subscriptions`)
      .then((response) => response.json())
      .then((data) => {
        setSubscriptions(data);
      })
      .catch((error) => {
        console.error(error);
      });

  };


  useEffect(() => {

    loadPayments();
    loadSubscriptions();

  }, []);


  const handleChange = (event) => {

    setForm({
      ...form,
      [event.target.name]: event.target.value
    });

  };


  const openAddForm = () => {

    setEditingPayment(null);

    setForm({
      subscription_id: "",
      amount: "",
      payment_date: "",
      payment_method: "UPI",
      status: "completed"
    });

    setShowForm(true);

  };


  const openEditForm = (payment) => {

    setEditingPayment(payment);

    setForm({
      subscription_id: payment.subscription_id,
      amount: payment.amount,
      payment_date: payment.payment_date
        ? payment.payment_date.substring(0, 10)
        : "",
      payment_method: payment.payment_method || "UPI",
      status: payment.status
    });

    setShowForm(true);

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    const url = editingPayment
  ? `${API_URL}/api/payments/${editingPayment.payment_id}`
  : `${API_URL}/api/payments`;

    const method = editingPayment ? "PUT" : "POST";

    try {

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Operation failed"
        );
      }

      setShowForm(false);
      setEditingPayment(null);

      loadPayments();

    } catch (error) {

      console.error(error);
      alert(error.message);

    }

  };


  const deletePayment = async (paymentId) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmed) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/api/payments/${paymentId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      loadPayments();

    } catch (error) {

      console.error(error);
      alert(error.message);

    }

  };


  const filteredPayments = payments.filter((payment) => {

    const searchText = search.toLowerCase();

    return (
      String(payment.payment_id).includes(searchText) ||
      payment.customer_name.toLowerCase().includes(searchText) ||
      payment.plan_name.toLowerCase().includes(searchText) ||
      payment.status.toLowerCase().includes(searchText)
    );

  });


  return (

    <div className="customers-page">

      <div className="page-header">

        <div>

          <h1>Payments</h1>

          <p>
            Manage subscription payments
          </p>

        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Payment
        </button>

      </div>


      <div className="customer-toolbar">

        <div className="customer-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <span>
          {filteredPayments.length} payments
        </span>

      </div>


      {showForm && (

        <div className="customer-form-card">

          <div className="form-header">

            <h2>
              {editingPayment
                ? "Edit Payment"
                : "Add Payment"}
            </h2>

            <button
              className="close-button"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Subscription
                </label>

                <select
                  name="subscription_id"
                  value={form.subscription_id}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Subscription
                  </option>

                  {subscriptions.map((subscription) => (

                    <option
                      key={subscription.subscription_id}
                      value={subscription.subscription_id}
                    >

                      #{subscription.subscription_id}
                      {" - "}
                      {subscription.customer_name}
                      {" - "}
                      {subscription.plan_name}

                    </option>

                  ))}

                </select>

              </div>


              <div className="form-group">

                <label>
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Payment Date
                </label>

                <input
                  type="date"
                  name="payment_date"
                  value={form.payment_date}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Payment Method
                </label>

                <select
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                  required
                >

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Card">
                    Card
                  </option>

                  <option value="Net Banking">
                    Net Banking
                  </option>

                  <option value="Cash">
                    Cash
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >

                  <option value="completed">
                    Completed
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="failed">
                    Failed
                  </option>

                </select>

              </div>

            </div>


            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {editingPayment
                  ? "Update Payment"
                  : "Add Payment"}
              </button>

            </div>

          </form>

        </div>

      )}


      <div className="customers-table-card">

        <table>

          <thead>

            <tr>

              <th>ID</th>
              <th>Customer</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Method</th>
              <th>Status</th>
              <th>Actions</th>

            </tr>

          </thead>


          <tbody>

            {filteredPayments.map((payment) => (

              <tr key={payment.payment_id}>

                <td>
                  #{payment.payment_id}
                </td>

                <td>
                  <strong>
                    {payment.customer_name}
                  </strong>
                </td>

                <td>
                  {payment.plan_name}
                </td>

                <td>
                  ₹{Number(payment.amount).toLocaleString("en-IN")}
                </td>

                <td>
                  {payment.payment_date
                    ? payment.payment_date.substring(0, 10)
                    : "-"}
                </td>

                <td>
                  {payment.payment_method}
                </td>

                <td>
                  <span className="payment-status">
                    {payment.status}
                  </span>
                </td>

                <td>

                  <div className="action-buttons">

                    <button
                      className="edit-button"
                      onClick={() =>
                        openEditForm(payment)
                      }
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deletePayment(payment.payment_id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}

export default Payments;